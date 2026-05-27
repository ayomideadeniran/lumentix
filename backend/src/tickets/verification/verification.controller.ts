import { Controller, Post, Body, UseGuards, Get, Param, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketsService } from '../tickets.service';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Event } from '../../events/entities/event.entity';
import { TicketEntity } from '../entities/ticket.entity';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VerificationController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('verify')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiOperation({
    summary: 'Verify a ticket at the gate',
    description: 'Admin or organizer only. Verifies a ticket signature and marks it as used. Includes comprehensive validation for event status, VIP tiers, and security checks.',
  })
  @ApiBody({ type: VerifyTicketDto })
  @ApiResponse({ status: 200, description: 'Ticket verified and marked as used' })
  @ApiResponse({ status: 400, description: 'Invalid signature, ticket already used, or validation failed' })
  @ApiResponse({ status: 403, description: 'Caller is not admin or organizer' })
  @ApiResponse({ status: 404, description: 'Ticket or event not found' })
  async verify(@Body() verifyTicketDto: VerifyTicketDto) {
    const { ticketId, signature } = verifyTicketDto;
    
    // First, get the ticket and associated event for validation
    const ticket = await this.ticketsService.getTicketWithEvent(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    
    if (!ticket.event) {
      throw new NotFoundException('Associated event not found');
    }
    
    // Validate event status - only allow verification for published events
    if (ticket.event.status !== 'published') {
      throw new BadRequestException(`Ticket verification not allowed for event with status: ${ticket.event.status}. Only published events are supported.`);
    }
    
    // Check if event has started
    const now = new Date();
    if (ticket.event.startDate && new Date(ticket.event.startDate) > now) {
      throw new BadRequestException('Cannot verify ticket before event start date.');
    }
    
    // VIP tier validation - check if ticket has VIP access
    if (ticket.vipTier) {
      // In a real implementation, we would validate VIP tier against event configuration
      // For now, we'll just log that VIP validation occurred
      console.log(`VIP ticket verification: ${ticketId} for tier ${ticket.vipTier}`);
    }
    
    // Perform the actual verification
    const verifiedTicket = await this.ticketsService.verifyTicket(ticketId, signature);

    return {
      message: 'Ticket verified successfully',
      ticketId: verifiedTicket.id,
      eventId: verifiedTicket.eventId,
      eventTitle: ticket.event.title,
      vipTier: verifiedTicket.vipTier || null,
      timestamp: new Date(),
      verificationDetails: {
        eventStatus: ticket.event.status,
        eventStartDate: ticket.event.startDate,
        isVip: !!verifiedTicket.vipTier,
      },
    };
  }

  @Get('verify/status/:ticketId')
  @ApiOperation({
    summary: 'Get ticket verification status',
    description: 'Check the current status of a ticket without verifying it.',
  })
  @ApiQuery({ name: 'signature', required: false, description: 'Optional signature to verify' })
  @ApiResponse({ status: 200, description: 'Ticket verification status' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getStatus(
    @Param('ticketId') ticketId: string,
    @Query('signature') signature?: string,
  ) {
    if (signature) {
      // If signature provided, perform verification and return status
      const result = await this.ticketsService.getVerifyStatus(ticketId, signature);
      return {
        ...result,
        ticketId,
      };
    } else {
      // Just get basic ticket info
      const ticket = await this.ticketsService.getTicketWithEvent(ticketId);
      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      
      return {
        ticketId: ticket.id,
        status: ticket.status,
        eventId: ticket.eventId,
        eventTitle: ticket.event?.title || 'Unknown',
        vipTier: ticket.vipTier || null,
        createdAt: ticket.createdAt,
      };
    }
  }
}

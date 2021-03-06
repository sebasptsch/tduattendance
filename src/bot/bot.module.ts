import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AttendanceService } from 'src/attendance/attendance.service';
import { EventService } from 'src/event/event.service';
import { RsvpModule } from 'src/rsvp/rsvp.module';
import { RsvpService } from 'src/rsvp/rsvp.service';
import { ScancodeModule } from 'src/scancode/scancode.module';
import { ScancodeService } from 'src/scancode/scancode.service';
import { EventsCommand } from './commands/events.command';

import { PingCommand } from './commands/ping.command';

@Module({
  imports: [
    DiscordModule.forFeature(),
    RsvpModule,
    AttendanceModule,
    ScancodeModule,
    EventService,
  ],
  providers: [
    PingCommand,
    EventsCommand,
    RsvpService,
    AttendanceService,
    ScancodeService,
    EventService,
  ],
})
export class BotModule {}

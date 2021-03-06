import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import ical, { ICalAttendeeStatus, ICalCalendarJSONData } from 'ical-generator';
import { RSVPStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
@Injectable()
export class CalendarService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  private readonly logger = new Logger(CalendarService.name);
  async generateCalendar() {
    const cachedCalendar = await this.cacheManager.get<ICalCalendarJSONData>(
      'calendar',
    );
    if (cachedCalendar) {
      return ical({ ...cachedCalendar });
    } else {
      this.logger.log('Generating Calendar');
      const events = await this.prismaService.event.findMany({
        include: {
          RSVP: {
            include: {
              user: true,
            },
          },
        },
      });
      const calendar = ical({
        name: 'TDU Attendance',
        description: 'The TDU Attendance Calendar',
        events: events.map((event) => {
          return {
            start: event.startDate,
            end: event.endDate,
            summary: event.title,
            allDay: event.allDay,
            attendees: event.RSVP.map((rsvp) => {
              const status: ICalAttendeeStatus =
                rsvp.status === 'YES'
                  ? ICalAttendeeStatus.ACCEPTED
                  : rsvp.status === 'MAYBE'
                  ? ICalAttendeeStatus.TENTATIVE
                  : rsvp.status === 'NO'
                  ? ICalAttendeeStatus.DECLINED
                  : ICalAttendeeStatus.NEEDSACTION;

              return {
                name: `${rsvp.user.firstName} ${rsvp.user.lastName}`,
                status,
                email: rsvp.user.email,
              };
            }),
          };
        }),
      });
      await this.cacheManager.set<ICalCalendarJSONData>(
        'calendar',
        calendar.toJSON(),
        { ttl: 7200 },
      );
      return calendar;
    }
  }
}

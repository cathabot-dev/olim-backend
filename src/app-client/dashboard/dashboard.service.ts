import { Injectable } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { ParticipantStatus } from 'src/shared/enums/participants.enum';
import { DataSource } from 'typeorm';
import { PaymentService } from '../payment/payment.service';
import { EventSettingService } from '../event-setting/event-setting.service';

@Injectable()
export class DashboardService {
  constructor(
    private datasource: DataSource,
    private paymentService: PaymentService,
    private eventSettings: EventSettingService,
  ) {}
  async getDashboardData(user: Users) {
    const eventDate = await this.eventSettings.findStartEndDate();
    const paymentPendings = await this.paymentService.getPendingPayment(user);
    const dashboardQuery = `
                  SELECT (SELECT COUNT(*) FROM participants WHERE status = '${ParticipantStatus.ACTIVE}' AND user_id = ${user.id}) as total_participant_success,
                  (SELECT COUNT(*) FROM participants WHERE status = '${ParticipantStatus.CANCEL}' AND user_id = ${user.id}) AS total_participant_cancel
                  ;`;
    try {
      const res = await this.datasource.query(dashboardQuery);
      return Object.assign(res[0], {
        payment_pending_lists: paymentPendings,
        event_setting: eventDate,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

import { User } from '@trokai/shared-core';
import { UserService } from '@trokai/shared-data-access';
import {
  AlertService,
  ProfileFormComponent,
  ProfileFormValue,
} from '@trokai/shared-ui';
import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [ProfileFormComponent],
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private completingInfoService = inject(CompletingInformationService);
  private route = inject(ActivatedRoute);
  private dialogService = inject(DialogService);

  user!: User;

  emailRegistered = false;
  phoneRegistered = false;

  completingInformation = false;
  promptedPhoneVerification = false;

  get phoneVerifying() {
    return this.route.snapshot.queryParams['phone-verify'];
  }

  ngOnInit() {
    this.completingInformation = this.route.snapshot.queryParams['completing'];

    this.authService.user.subscribe((u) => {
      if (!u) return;
      this.user = u;
      if (
        this.phoneVerifying &&
        !this.user.phoneVerified &&
        !this.promptedPhoneVerification
      ) {
        this.verifyPhone();
      }
    });
  }

  async save(value: ProfileFormValue) {
    // PATCH /users/me expects FLAT keys (mapped to seller.* server-side).
    const patch: Record<string, unknown> = {
      name: value.name,
      email: value.email,
      cpf: value.cpf,
      phone: value.phone,
      birthday: value.birthday,
    };

    if (this.user.seller?.inPerson == null) patch['inPerson'] = false;
    if (this.user.seller?.shipping == null) patch['shipping'] = false;

    try {
      await this.authService.updateUser(patch);
      if (this.completingInformation) this.completingInfoService.next();
      this.alertService.postSuccess();
    } catch {
      // updateUser surfaces its own error
    }
  }

  async checkMail(email: string) {
    if (this.user.email == email) {
      this.emailRegistered = false;
      return;
    }
    this.emailRegistered = await this.userService.emailRegistered(email);
  }

  async checkPhone(phone: string) {
    if (this.user.phone == phone) {
      this.phoneRegistered = false;
      return;
    }
    this.phoneRegistered = await this.userService.phoneRegistered(phone);
  }

  async verifyPhone() {
    this.promptedPhoneVerification = true;
    const success = await this.dialogService.openPhoneVerifyDialog();
    if (success) {
      await this.authService.syncUserData();
      if (this.phoneVerifying) this.completingInfoService.next();
    }
  }
}

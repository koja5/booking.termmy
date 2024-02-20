import { Component, Input, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-toastr",
  templateUrl: "./toastr.component.html",
  styleUrls: ["./toastr.component.scss"],
})
export class ToastrComponent implements OnInit {
  private language: any;

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {}

  showSuccessCustom(title: string, text?: string) {
    this.toastr.success(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  showInfoCustom(title: string, text?: string) {
    this.toastr.info(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  showErrorCustom(title: string, text?: string) {
    this.toastr.error(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }
  showWarningCustom(title: string, text?: string) {
    this.toastr.warning(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  showSuccess() {
    const language = JSON.parse(localStorage.getItem("language") ?? "{}");
    this.toastr.success(
      this.translate.instant("actionMessage.successExecuteActionTextDefault"),
      this.translate.instant("actionMessage.successExecuteActionTitleDefault"),
      {
        timeOut: 7000,
        positionClass: "toast-bottom-right",
      }
    );
  }

  showInfo() {
    this.toastr.info("Your action executed successfuly!", "", {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  showError() {
    const language = JSON.parse(localStorage.getItem("language") ?? "{}");
    this.toastr.error(language.generalErrorExecuteAction, "", {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }
  showWarning() {
    const language = JSON.parse(localStorage.getItem("language") ?? "{}");
    this.toastr.warning(language.generalErrorExecuteAction, "", {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }
}

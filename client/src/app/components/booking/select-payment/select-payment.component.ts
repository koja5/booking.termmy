import { Component, Input, ViewChild } from '@angular/core';
import { StripeCard } from 'stripe-angular';

@Component({
  selector: 'app-select-payment',
  templateUrl: './select-payment.component.html',
  styleUrls: ['./select-payment.component.scss'],
})
export class SelectPaymentComponent {
  @ViewChild('stripeCard') stripeCard!: StripeCard;
  @Input() config: any;

  public isCollapsePayByCreditCard = false;
  public isCollapsePayOnArrival = true;

  setStripeToken(token: stripe.Token) {
    console.log(token);
  }

  onStripeError(error: any) {
    // this.toastr.showErrorCustom(this.language.paymentCardIsNotValid);
  }

  payAndBooked() {
    this.stripeCard.createToken();
  }
}

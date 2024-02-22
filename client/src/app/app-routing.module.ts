import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/booking/common/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: NotFoundComponent },
  {
    path: ':id',
    loadChildren: () =>
      import('./components/booking/booking.module').then(
        (m) => m.BookingModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

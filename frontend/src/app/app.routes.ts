import { Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { AdminDashboardComponent } from "./admin/admin-dashboard/admin-dashboard.component";
import { UserDashboardComponent } from "./user/user-dashboard/user-dashboard.component";
import { ReportFormComponent } from "./admin/report-form/report-form.component";
import { UserManagementComponent } from "./admin/user-management/user-management.component";
import { UserFormComponent } from "./admin/user-form/user-form.component";
import { NotFoundComponent } from "./shared/not-found/not-found.component";
import { ProfileComponent } from "./shared/profile/profile.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { AdminGuard } from "./core/guards/admin.guard";
import { ReportListComponent } from "./shared/report-list/report-list.component";

export const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    {
        path: "admin",
        component: AdminDashboardComponent,
        canActivate: [AuthGuard, AdminGuard],
        children: [
            { path: "", redirectTo: "reports", pathMatch: "full" },
            { path: "reports", component: ReportFormComponent },
            { path: "reports/edit/:id", component: ReportFormComponent },
            { path: "users", component: UserManagementComponent },
            { path: "users/add", component: UserFormComponent },
            { path: "users/edit/:id", component: UserFormComponent },
            { path: "profile", component: ProfileComponent },
        ],
    },
    {
        path: "user",
        component: UserDashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: "", redirectTo: "reports", pathMatch: "full" },
            { path: "reports", component: ReportListComponent },
            { path: "profile", component: ProfileComponent },
        ],
    },
    { path: "**", component: NotFoundComponent },
];
import { Routes } from "@angular/router";
import { ProposalComponent } from "./pages/proposal/proposal.component";
import { accessGuard } from "../../core/guards/access.guard";

export const PRIVATE_ROUTES: Routes = [
    {
        path: 'proposal',
        component: ProposalComponent,
        canActivate: [accessGuard]
    }
];
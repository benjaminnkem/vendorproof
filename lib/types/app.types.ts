import { BusinessVerificationTypes, Socials, Tier } from '../utils/app';

export interface IAppConfig {
  tierNames: Tier[];
  socials: Socials[];
  businessVerificationTypes: BusinessVerificationTypes[];
}

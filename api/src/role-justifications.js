import { tailoredRoleNames } from './roles.js';

// Each role supplies ten capability-specific subjects. Combined with the ten
// authored frames per tone, this produces 100 unique, paste-ready reasons per
// tone and tailored role without making random selection depend on a service.
const subjects = {
  'Global Administrator': [
    'tenant-wide identity configuration', 'emergency access account settings', 'organization-wide service settings', 'directory-wide security controls', 'tenant administration required for an active incident', 'cross-service identity dependencies', 'privileged tenant configuration after an approved change', 'tenant-wide access recovery', 'organization-level administrative settings', 'the tenant configuration required to resolve the service issue',
  ],
  'Security Administrator': [
    'security configuration affecting the reported incident', 'security alerts and investigation settings', 'tenant security policies under review', 'security controls required for approved remediation', 'security reporting needed for incident triage', 'identity protection configuration', 'security operations settings during the response', 'security policy changes in the maintenance window', 'security findings requiring validation', 'security controls affected by the open incident',
  ],
  'Global Reader': [
    'tenant-wide configuration for a scheduled review', 'read-only tenant settings for the investigation', 'organization-level audit evidence', 'the configuration needed to assess the reported issue', 'tenant-wide service settings before the change', 'directory settings for the access review', 'read-only evidence for the incident review', 'the effective configuration of the affected service', 'tenant-wide settings needed for the assessment', 'the current tenant state before remediation',
  ],
  'Intune Administrator': [
    'device compliance policies affecting sign-in', 'managed device configuration for the support case', 'Intune enrollment settings for the affected device', 'application deployment policy for the approved rollout', 'device security baselines under review', 'endpoint configuration required for remediation', 'mobile device management settings for the incident', 'Intune assignment results for the affected users', 'device update policy before deployment', 'endpoint compliance evidence for the investigation',
  ],
  'Privileged Role Administrator': [
    'PIM role assignments for the approved staffing change', 'eligible role assignments under access review', 'PIM activation settings for the support process', 'privileged role scope before the approved change', 'role assignment audit evidence', 'PIM approval configuration for the incident', 'expired privileged assignments requiring validation', 'role eligibility required for the response', 'administrative unit role assignments', 'PIM notifications and assignment settings',
  ],
  'Conditional Access Administrator': [
    'Conditional Access policies affecting the reported sign-in', 'report-only Conditional Access results', 'named locations used by the affected policy', 'grant controls required for approved remediation', 'session controls affecting the application', 'Conditional Access exclusions for the support case', 'policy assignments before the rollout', 'risk-based access controls under review', 'authentication context required by the application', 'Conditional Access policy evidence for the incident',
  ],
  'Authentication Administrator': [
    'a non-administrator authentication method for the support case', 'MFA registration required to restore user access', 'authentication method details for the verified user', 'passwordless sign-in registration under review', 'authentication reset required by the approved request', 'non-admin MFA settings affecting the incident', 'authentication method evidence for troubleshooting', 'the affected user’s registration state', 'authentication recovery options for the verified user', 'the authentication method change requested by support',
  ],
  'Privileged Authentication Administrator': [
    'an administrator authentication method for the support case', 'privileged-user MFA registration required for recovery', 'authentication method details for the affected administrator', 'a privileged authentication reset requested through the approved process', 'administrator passwordless registration under review', 'authentication recovery for the verified administrator', 'the privileged user’s registration state', 'administrator authentication evidence for the investigation', 'an elevated authentication method affected by the incident', 'the approved authentication change for the administrator',
  ],
  'User Administrator': [
    'the affected user account for the approved request', 'user lifecycle settings required for offboarding', 'user attributes blocking application access', 'the user account recovery required by support', 'user and group membership changes under review', 'the affected user’s license assignment', 'the account configuration needed for onboarding', 'user ownership details for the service issue', 'the user account status required for remediation', 'user account audit evidence for the investigation',
  ],
  'Groups Administrator': [
    'security group membership for the approved access change', 'group ownership after the staffing change', 'dynamic group rules affecting the affected users', 'group expiration settings under review', 'group-based access required by the incident', 'the security group configuration blocking the application', 'group membership audit evidence', 'group settings needed for the rollout', 'the affected group’s ownership and membership', 'group lifecycle configuration for the approved request',
  ],
  'Application Administrator': [
    'the application registration required by the integration change', 'enterprise application settings affecting sign-in', 'application credentials approaching expiry', 'application permissions under approved review', 'single sign-on settings for the affected application', 'application ownership required for support', 'the service principal configuration blocking access', 'application consent settings for the investigation', 'the application redirect configuration for the rollout', 'enterprise application assignment settings',
  ],
  'Cloud Application Administrator': [
    'the cloud application registration required by the integration change', 'cloud enterprise application configuration affecting sign-in', 'cloud application credentials approaching expiry', 'cloud application permissions under approved review', 'single sign-on settings for the affected cloud application', 'cloud application ownership required for support', 'the cloud service principal configuration blocking access', 'cloud application consent settings for the investigation', 'the cloud application redirect configuration for the rollout', 'cloud enterprise application assignment settings',
  ],
  'Identity Governance Administrator': [
    'access package assignments following the approved review', 'access review settings for the affected resources', 'lifecycle workflow configuration for the support case', 'entitlement management policy under review', 'access review remediation for expired access', 'identity governance controls required by the incident', 'access package catalog settings for the rollout', 'lifecycle workflow evidence for the investigation', 'the governance assignment blocking user access', 'access review ownership required for remediation',
  ],
};

const frames = [
  [
    subject => `Reviewing ${subject} as part of an approved support activity.`,
    subject => `Validating ${subject} before applying an approved change.`,
    subject => `Investigating ${subject} to resolve the reported access issue.`,
    subject => `Checking ${subject} during the scheduled maintenance window.`,
    subject => `Updating ${subject} following an approved request.`,
    subject => `Verifying ${subject} after the reported service interruption.`,
    subject => `Reviewing ${subject} before the planned rollout.`,
    subject => `Correcting ${subject} to restore approved access.`,
    subject => `Gathering audit evidence for ${subject}.`,
    subject => `Confirming that ${subject} matches the documented requirement.`,
  ],
  [
    subject => `Reviewing ${subject}, because the configuration has acquired some history.`,
    subject => `Validating ${subject} before it becomes the next support conversation.`,
    subject => `Investigating ${subject}, which has selected an inconvenient moment for individuality.`,
    subject => `Checking ${subject} during the maintenance window, in a daring use of scheduling.`,
    subject => `Updating ${subject} so the approved request becomes actual access.`,
    subject => `Verifying ${subject} beyond the reassuring status indicator.`,
    subject => `Reviewing ${subject} before the rollout introduces additional opinions.`,
    subject => `Correcting ${subject} before the workaround becomes the documentation.`,
    subject => `Gathering audit evidence for ${subject} while the details are still memorable.`,
    subject => `Confirming ${subject} matches the requirement rather than its own interpretation.`,
  ],
  [
    subject => `Reviewing ${subject}, because “it was working yesterday” is not configuration evidence.`,
    subject => `Validating ${subject} before the approved change becomes a group activity.`,
    subject => `Investigating ${subject}, whose current behavior has exceeded the ticket summary.`,
    subject => `Checking ${subject} during the maintenance window, where maintenance is still the plan.`,
    subject => `Updating ${subject} so approval can have an observable effect.`,
    subject => `Verifying ${subject} outside the meeting where we agreed it was fixed.`,
    subject => `Reviewing ${subject} before the rollout turns assumptions into findings.`,
    subject => `Correcting ${subject} before the workaround receives its own owner.`,
    subject => `Gathering audit evidence for ${subject}, our most reliable source of workplace nonfiction.`,
    subject => `Confirming ${subject} matches the requirement, not the nearest available setting.`,
  ],
  [
    subject => `Reviewing ${subject} before the incident review confidently invents its own explanation.`,
    subject => `Validating ${subject} because approved access should not require a folklore degree.`,
    subject => `Investigating ${subject}, which has become unexpectedly selective.`,
    subject => `Checking ${subject} during the maintenance window before it finds a more public audience.`,
    subject => `Updating ${subject} so the request can stop being merely aspirational.`,
    subject => `Verifying ${subject}; “saved successfully” has made limited promises before.`,
    subject => `Reviewing ${subject} before the rollout gives us production feedback.`,
    subject => `Correcting ${subject} before the exception becomes a policy.`,
    subject => `Gathering audit evidence for ${subject} before memory becomes the control.`,
    subject => `Confirming ${subject} matches the requirement instead of today’s workaround.`,
  ],
  [
    subject => `Reviewing ${subject}, because the incident deserves more than an optimistic interpretation.`,
    subject => `Validating ${subject} before another approved request develops a workaround.`,
    subject => `Investigating ${subject}, currently demonstrating creative independence.`,
    subject => `Checking ${subject} during the maintenance window before it becomes everyone’s afternoon.`,
    subject => `Updating ${subject} so approval, documentation, and reality can briefly agree.`,
    subject => `Verifying ${subject} beyond the ceremonial green check mark.`,
    subject => `Reviewing ${subject} before the rollout upgrades our assumptions to incidents.`,
    subject => `Correcting ${subject} before it earns a permanent exception.`,
    subject => `Gathering audit evidence for ${subject}, since confidence is not a retention policy.`,
    subject => `Confirming ${subject} matches the requirement and not the last person to touch it.`,
  ],
  [
    subject => `Reviewing ${subject}, because “nothing changed” has submitted another application.`,
    subject => `Validating ${subject} before access restoration becomes a multi-quarter initiative.`,
    subject => `Investigating ${subject}, which has mistaken its configuration for a creative-writing prompt.`,
    subject => `Checking ${subject} during the maintenance window, our final attempt at doing this quietly.`,
    subject => `Updating ${subject} so the approved request can finally meet the system it was approved for.`,
    subject => `Verifying ${subject} outside the chat where someone declared the issue resolved.`,
    subject => `Reviewing ${subject} before the rollout turns a theory into an outage.`,
    subject => `Correcting ${subject} before the workaround gains a budget and a steering committee.`,
    subject => `Gathering audit evidence for ${subject}, because memory has already begun its rewrite.`,
    subject => `Confirming ${subject} matches the requirement rather than the configuration’s personal journey.`,
  ],
];

export const roleJustifications = Object.fromEntries(
  [...tailoredRoleNames].map(name => [
    name,
    frames.map(level => level.flatMap(frame => subjects[name].map(frame))),
  ]),
);

/**
 * Account-type helper (visual only for now).
 *
 * The portal-v2 design adapts labels and a few layout details depending
 * on the business type of the account. Until we persist `account.type`
 * on Supabase, this file hardcodes a single type and exposes helpers
 * the UI consumes. Future: read from `accounts.account_type` and let
 * an admin toggle via a real switcher.
 */

export type AccountType = "real_estate" | "franchise" | "service" | "enterprise";

export interface AccountTypeMeta {
  key: AccountType;
  type: string;
  shortTitle: string;
  initials: string;
  accountColor: string;
  desc: string;
  features: { t: string; d: string }[];
}

export const ACCOUNT_TYPES: Record<AccountType, AccountTypeMeta> = {
  real_estate: {
    key: "real_estate",
    type: "Real Estate",
    shortTitle: "Real estate",
    initials: "RE",
    accountColor: "#2563EB",
    desc: "Manage properties, tenancies, compliance and planned maintenance across your portfolio.",
    features: [
      { t: "Property portfolio", d: "Track every property, unit and tenancy" },
      { t: "Tenant reporting", d: "Tenants report issues → auto-executed by Fixfy" },
      { t: "Compliance automation", d: "Gas Safe, EICR, EPC — never miss an expiry" },
      { t: "PPM per property", d: "Custom maintenance plans for each unit" },
    ],
  },
  franchise: {
    key: "franchise",
    type: "Franchise",
    shortTitle: "Franchise",
    initials: "FR",
    accountColor: "#D97706",
    desc: "Keep every franchise location consistent, compliant and operational.",
    features: [
      { t: "Multi-location", d: "One dashboard across every franchise" },
      { t: "Brand consistency", d: "Standardised scopes & SLAs per site" },
      { t: "Franchisee access", d: "Each franchisee sees only their site" },
      { t: "Rolled-up reporting", d: "HQ sees portfolio-wide KPIs" },
    ],
  },
  service: {
    key: "service",
    type: "Service Platform",
    shortTitle: "Service platform",
    initials: "SP",
    accountColor: "#EA4C0B",
    desc: "Sell maintenance services — including PPM — to your own client base, powered by Fixfy.",
    features: [
      { t: "White-label execution", d: "Your brand, Fixfy delivery" },
      { t: "Sell PPM plans", d: "Offer recurring maintenance to clients" },
      { t: "Commercial margins", d: "Set your own markup on every job" },
      { t: "Full client portal", d: "Your clients get a branded view" },
    ],
  },
  enterprise: {
    key: "enterprise",
    type: "Enterprise",
    shortTitle: "Enterprise",
    initials: "EN",
    accountColor: "#16A34A",
    desc: "Single or multi-site operations — from one flagship location to a national estate.",
    features: [
      { t: "Single or multi-site", d: "Scales from 1 to 1,000+ locations" },
      { t: "Custom SLAs", d: "Priority response bespoke to your ops" },
      { t: "Dedicated AM", d: "One team handling everything for you" },
      { t: "Enterprise reporting", d: "Consolidated finance, compliance, KPIs" },
    ],
  },
};

// Default account type until persisted on the backend.
export const DEFAULT_ACCOUNT_TYPE: AccountType = "real_estate";

type LabelKey =
  | "sites"
  | "sitesSingular"
  | "sitesPageTitle"
  | "ppm"
  | "propertyDrawerOverview"
  | "tenantApp";

const LABELS: Record<AccountType, Record<LabelKey, string>> = {
  real_estate: {
    sites: "Properties",
    sitesSingular: "property",
    sitesPageTitle: "Properties",
    ppm: "PPM plans",
    propertyDrawerOverview: "Property overview",
    tenantApp: "Tenant app — coming soon",
  },
  franchise: {
    sites: "Sites",
    sitesSingular: "site",
    sitesPageTitle: "Sites",
    ppm: "Maintenance plans",
    propertyDrawerOverview: "Site overview",
    tenantApp: "",
  },
  service: {
    sites: "Clients",
    sitesSingular: "client",
    sitesPageTitle: "Clients",
    ppm: "Maintenance plans",
    propertyDrawerOverview: "Client overview",
    tenantApp: "",
  },
  enterprise: {
    sites: "Sites",
    sitesSingular: "site",
    sitesPageTitle: "Sites",
    ppm: "Maintenance plans",
    propertyDrawerOverview: "Site overview",
    tenantApp: "",
  },
};

export function getAccountType(): AccountType {
  return DEFAULT_ACCOUNT_TYPE;
}

export function getAccountMeta(type: AccountType = getAccountType()): AccountTypeMeta {
  return ACCOUNT_TYPES[type];
}

export function t(key: LabelKey, type: AccountType = getAccountType()): string {
  return LABELS[type][key];
}

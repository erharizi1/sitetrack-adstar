/**
 * All user-facing strings, in Albanian.
 *
 * Kept in one place so copy can be reviewed and corrected without touching
 * components — the pilot's users are Albanian-speaking, and the wording still
 * needs a native-speaker pass.
 */
export const labels = {
  app: {
    name: "SiteTrack",
  },
  nav: {
    engineer: "Inxhinieri",
    pm: "Menaxheri",
  },
  engineer: {
    title: "Ditari i sotëm",
    tabs: {
      materials: "Materiale",
      labor: "Fuqi punëtore",
    },
    addMaterial: "Shto material",
    addLabor: "Shto punëtor",
    subtotalMaterials: "Materiale",
    subtotalLabor: "Fuqi punëtore",
    dayTotal: "Kosto e ditës",
    submit: "Paraqit ditën",
  },
  pm: {
    title: "Paneli i menaxherit",
  },
  common: {
    currency: "L",
    placeholder: "Në ndërtim",
  },
} as const;

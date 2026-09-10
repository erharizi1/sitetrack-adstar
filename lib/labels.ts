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
    technician: "Tekniku",
    engineer: "Inxhinieri",
  },
  technician: {
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
    submitting: "Duke paraqitur…",
    submitHint: "Do t’i dërgohet inxhinierit për miratim",
    emptyMaterials: "Asnjë material i regjistruar sot",
    emptyLabor: "Asnjë punëtor i regjistruar sot",
    otherTabHint: "kalo te skeda tjetër për t’i parë",
    chooseMaterial: "Zgjidh material",
    chooseLabor: "Zgjidh rolin",
    quantity: "Sasia",
    workers: "Punëtorë",
    hours: "Orë",
    lineCost: "Kosto e rreshtit",
    addToLog: "Shto në ditar",
    cancel: "Anulo",
    remove: "Hiq",
    status: {
      draft: "Draft",
      submitted: "Paraqitur",
      approved: "Miratuar",
      rejected: "Refuzuar",
    },
  },
  engineer: {
    title: "Paneli i inxhinierit",
  },
  common: {
    currency: "L",
    placeholder: "Në ndërtim",
  },
} as const;

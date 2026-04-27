/**
 * Heurísticas de “Compass”: siguientes pasos sugeridos según señal reciente.
 * No sustituye reglas de negocio; solo guía en la UI del deck.
 */

export type CompassItemId =
  | "billboard"
  | "mapRoom"
  | "bounties"
  | "payday"
  | "settlement"
  | "wires"
  | "almanac"
  | "arsenal"
  | "opBounties"
  | "opLedger"
  | "opPayday";

export type CompassItem = {
  id: CompassItemId;
  href: string;
};

const HREF: Record<CompassItemId, string> = {
  billboard: "/ledger/billboard",
  mapRoom: "/ledger/map-room",
  bounties: "/ledger/bounties",
  payday: "/ledger/payday",
  settlement: "/ledger/settlement",
  wires: "/ledger/wires",
  almanac: "/ledger/almanac",
  arsenal: "/ledger/arsenal",
  opBounties: "/ledger/bounties",
  opLedger: "/ledger",
  opPayday: "/ledger/payday",
};

function item(id: CompassItemId): CompassItem {
  return { id, href: HREF[id] };
}

export function getCreatorCompassItems(state: {
  totalClicks7d: number;
  conv7d: number;
  commissionCents7d: number;
}): CompassItem[] {
  const { totalClicks7d, conv7d, commissionCents7d } = state;

  if (totalClicks7d === 0 && conv7d === 0) {
    return [item("billboard"), item("bounties"), item("almanac")];
  }

  if (conv7d === 0) {
    return [item("mapRoom"), item("bounties"), item("payday")];
  }

  if (commissionCents7d > 0) {
    return [item("settlement"), item("wires"), item("payday")];
  }

  return [item("payday"), item("bounties"), item("arsenal")];
}

export function getOperatorCompassItems(state: {
  activeBounties: number;
  conv7d: number;
}): CompassItem[] {
  const { activeBounties, conv7d } = state;
  if (activeBounties === 0) {
    return [item("opBounties"), item("opLedger"), item("opPayday")];
  }
  if (conv7d === 0) {
    return [item("opPayday"), item("opBounties"), item("opLedger")];
  }
  return [item("opBounties"), item("opPayday"), item("opLedger")];
}

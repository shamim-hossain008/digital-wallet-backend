import { FilterType } from "../types/filterType";

export function getStartDate(filter: FilterType ): Date {
  const startDate = new Date();

  switch (filter) {
    case "daily":
      startDate.setHours(0, 0, 0, 0);
      return startDate;

    case "monthly":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      return startDate;

    case "all":
      return new Date(0); // Unix epoch (1970)

    default:
      startDate.setHours(0, 0, 0, 0);
      return startDate;
  }
}

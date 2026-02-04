# Specification

## Summary
**Goal:** Improve the booking experience and hotel management by adding required room-type selection, availability/calendar support, persistent booking history with status filters, shareable hotel payment instructions, correct currency handling, and a bilingual (ID/EN) UI.

**Planned changes:**
- Add a required “Room type” field to the guest booking flow, sourced from the hotel’s room inventory, and store/display it in both guest booking history and hotel booking management.
- Add a Hotel Area calendar/availability view showing booking occupancy over time, and update the guest booking date selection to prevent/stop conflicting date ranges using backend-provided booked ranges.
- Fix Hotel Area booking history so confirmed bookings remain visible immediately; add a booking status filter (Pending / Confirmed / Rejected / Cancelled) with a default view that includes confirmed bookings.
- Add hotel-configurable manual payment methods/instructions in Hotel Area and show those instructions to guests after booking submission (with a clear fallback if none are configured).
- Add currency selection (minimum IDR and USD) for room pricing, persist currency per room, and format prices correctly across room browsing and booking UI.
- Add bilingual UI (Indonesian/English) with a language switcher that persists across reloads; translate key screens and ensure all new/changed text has EN + ID via the i18n system.
- Add safe conditional backend migration logic to support new fields (room currency, booking room type, hotel payment instructions) without trapping on legacy data.

**User-visible outcome:** Guests must select a room type and can pick dates that respect availability; guests see correct room prices (IDR/USD) and receive the hotel’s specific payment instructions after booking. Hotel users can view a calendar of occupancy, filter booking history by status (including confirmed), and manage payment instructions. The UI can be switched between Indonesian and English.

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface CreateStayRecordInput {
    hotelName: string;
    hotel: Principal;
    checkInDate: Time;
    guest: Principal;
    checkOutDate?: Time;
}
export interface HotelProfileWithPrincipal {
    principal: Principal;
    profile: HotelProfile;
}
export interface CreateBookingInput {
    hotel: Principal;
    room_type: string;
    checkInDate: Time;
    guest: Principal;
    checkOutDate: Time;
    guests: bigint;
}
export interface BookingRequest {
    id: bigint;
    status: BookingStatus;
    hotelName: string;
    hotel: Principal;
    createdAt: Time;
    lastUpdated: Time;
    room_type: string;
    checkInDate: Time;
    guest: Principal;
    checkOutDate: Time;
    guests: bigint;
}
export interface AdminRecoveryDiagnostics {
    accessControlInitialized: boolean;
    callerIsAdmin: boolean;
    caller: Principal;
}
export interface HealthStatus {
    ok: boolean;
    timestamp: Time;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface StayRecord {
    id: bigint;
    hotelName: string;
    hotel: Principal;
    createdAt: Time;
    checkInDate: Time;
    guest: Principal;
    checkOutDate?: Time;
}
export interface PersistentHotelVisibility {
    isPaid: boolean;
    isActive: boolean;
    isDummyHotel: boolean;
}
export interface AccountStatus {
    userProfileExists: boolean;
    callerIsAdmin: boolean;
    callerIsInvited: boolean;
}
export interface InviteToken {
    token: string;
    isConsumed: boolean;
}
export interface RoomInventory {
    pricePerNight: bigint;
    currency: RoomCurrency;
    promo?: string;
    roomType: string;
    photos: Array<string>;
}
export interface HotelProfile {
    country: string;
    logo?: string;
    name: string;
    payment_instructions?: string;
    location: MapLocation;
    rooms: Array<RoomInventory>;
    classification: HotelClassification;
}
export interface MapLocation {
    mapLink: string;
    address: string;
}
export interface PaymentRequest {
    id: string;
    status: PaymentStatus;
    option: PaymentOption;
    user: Principal;
    reference: string;
    amount: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface AdminHotelVisibilityView {
    hotel: Principal;
    visibility: PersistentHotelVisibility;
    profile?: HotelProfile;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    rejected = "rejected",
    confirmed = "confirmed"
}
export enum HotelClassification {
    threeStar = "threeStar",
    oneStar = "oneStar",
    fiveStar = "fiveStar",
    fourStar = "fourStar",
    jasmine = "jasmine",
    twoStar = "twoStar"
}
export enum PaymentOption {
    dana = "dana",
    gopay = "gopay",
    paypal = "paypal"
}
export enum PaymentStatus {
    pending = "pending",
    rejected = "rejected",
    confirmed = "confirmed"
}
export enum RoomCurrency {
    EUR = "EUR",
    IDR = "IDR",
    SGD = "SGD",
    USD = "USD"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminGetAllHotelVisibilityStats(): Promise<Array<AdminHotelVisibilityView>>;
    adminRecoveryDiagnostics(): Promise<AdminRecoveryDiagnostics>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(id: bigint): Promise<void>;
    checkInviteToken(token: string): Promise<boolean>;
    confirmBooking(id: bigint): Promise<void>;
    confirmPaymentRequest(id: string): Promise<void>;
    consumeInviteToken(token: string): Promise<boolean>;
    createBookingRequest(input: CreateBookingInput): Promise<bigint>;
    createPaymentRequest(amount: bigint, id: string, reference: string, option: PaymentOption): Promise<string>;
    createStayRecord(input: CreateStayRecordInput): Promise<bigint>;
    deleteRoomInventory(hotelPrincipal: Principal, roomType: string): Promise<void>;
    generateHotelInviteToken(token: string): Promise<string>;
    generateInviteCode(): Promise<string>;
    getAccountStatus(): Promise<AccountStatus>;
    getAllBookingRequests(): Promise<Array<BookingRequest>>;
    getAllHotelsWithPrincipals(): Promise<Array<HotelProfileWithPrincipal>>;
    getAllInviteTokens(): Promise<Array<InviteToken>>;
    getAllPaymentRequests(): Promise<Array<PaymentRequest>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getBookingRequest(id: bigint): Promise<BookingRequest>;
    getCallerPendingBookings(): Promise<Array<BookingRequest>>;
    getCallerProcessingBookings(): Promise<Array<BookingRequest>>;
    getCallerStayHistory(): Promise<Array<StayRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHotelBookings(): Promise<Array<BookingRequest>>;
    getHotelPendingBookings(): Promise<Array<BookingRequest>>;
    getHotelProfile(hotelPrincipal: Principal): Promise<HotelProfile | null>;
    getHotelVisibility(hotel: Principal): Promise<PersistentHotelVisibility>;
    getHotelsByCountry(country: string): Promise<Array<HotelProfile>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getPaymentRequest(id: string): Promise<PaymentRequest>;
    getTestingMode(): Promise<boolean>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    health(): Promise<HealthStatus>;
    isCallerAdmin(): Promise<boolean>;
    isCallerInvited(): Promise<boolean>;
    rejectBooking(id: bigint): Promise<void>;
    rejectPaymentRequest(id: string): Promise<void>;
    restoreAdminAccess(userProvidedToken: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveHotelProfile(profile: HotelProfile): Promise<void>;
    setHotelPaymentStatus(hotel: Principal, isPaid: boolean): Promise<void>;
    setHotelVisibility(hotel: Principal, isActive: boolean, isDummyHotel: boolean): Promise<void>;
    setTestingMode(enabled: boolean): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateRoomInventory(hotelPrincipal: Principal, room: RoomInventory): Promise<void>;
}

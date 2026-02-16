import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type RoomCurrency = {
    #IDR;
    #USD;
    #EUR;
    #SGD;
  };

  public type RoomInventory = {
    roomType : Text;
    pricePerNight : Nat;
    promo : ?Text;
    photos : [Text];
    currency : RoomCurrency;
  };

  public type PaymentStatus = {
    #pending;
    #confirmed;
    #rejected;
  };

  public type PaymentOption = {
    #paypal;
    #dana;
    #gopay;
  };

  public type HotelClassification = {
    #fiveStar;
    #fourStar;
    #threeStar;
    #twoStar;
    #oneStar;
    #jasmine;
  };

  public type AccountStatus = {
    callerIsAdmin : Bool;
    callerIsInvited : Bool;
    userProfileExists : Bool;
  };

  public type AdminRecoveryDiagnostics = {
    caller : Principal;
    callerIsAdmin : Bool;
    accessControlInitialized : Bool;
  };

  public type PaymentRequest = {
    id : Text;
    user : Principal;
    amount : Nat;
    reference : Text;
    option : PaymentOption;
    status : PaymentStatus;
  };

  public type MapLocation = {
    address : Text;
    mapLink : Text;
  };

  public type HotelProfile = {
    name : Text;
    classification : HotelClassification;
    location : MapLocation;
    country : Text;
    logo : ?Text;
    rooms : [RoomInventory];
    payment_instructions : ?Text;
  };

  public type MapLocationWithPrincipal = {
    location : MapLocation;
    principal : Principal;
  };

  public type HotelProfileWithRooms = {
    profile : HotelProfile;
    rooms : [RoomInventory];
  };

  public type HotelProfileWithPrincipal = {
    principal : Principal;
    profile : HotelProfile;
  };

  public type InviteToken = {
    token : Text;
    isConsumed : Bool;
  };

  public type StayRecord = {
    id : Nat;
    guest : Principal;
    hotel : Principal;
    hotelName : Text;
    checkInDate : Time.Time;
    checkOutDate : ?Time.Time;
    createdAt : Time.Time;
  };

  public type CreateStayRecordInput = {
    guest : Principal;
    hotel : Principal;
    hotelName : Text;
    checkInDate : Time.Time;
    checkOutDate : ?Time.Time;
  };

  public type BookingRequest = {
    id : Nat;
    guest : Principal;
    hotel : Principal;
    hotelName : Text;
    room_type : Text;
    checkInDate : Time.Time;
    checkOutDate : Time.Time;
    guests : Nat;
    status : BookingStatus;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #rejected;
    #cancelled;
  };

  public type CreateBookingInput = {
    guest : Principal;
    hotel : Principal;
    room_type : Text;
    checkInDate : Time.Time;
    checkOutDate : Time.Time;
    guests : Nat;
  };

  public type BookingActionInput = {
    bookingId : Nat;
    hotel : Principal;
  };

  public type PersistentHotelVisibility = {
    isDummyHotel : Bool;
    isActive : Bool;
    isPaid : Bool;
  };

  public type AdminHotelVisibilityView = {
    hotel : Principal;
    profile : ?HotelProfile;
    visibility : PersistentHotelVisibility;
  };

  public type HotelVisibility = {
    var isDummyHotel : Bool;
    var isActive : Bool;
    var isPaid : Bool;
  };

  // Health check response type
  public type HealthStatus = {
    ok : Bool;
    timestamp : Time.Time;
  };

  public type Review = {
    id : Nat;
    reviewer : Principal;
    targetType : Text;
    targetId : Principal;
    rating : Nat;
    comment : ?Text;
    createdAt : Time.Time;
  };

  public type ReviewInput = {
    targetType : Text;
    targetId : Principal;
    rating : Nat;
    comment : ?Text;
  };

  let paymentRequests = Map.empty<Text, PaymentRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let hotelProfiles = Map.empty<Principal, HotelProfile>();
  let inviteTokens = Map.empty<Text, InviteToken>();
  let invitedPrincipals = Map.empty<Principal, Bool>();
  let stayRecords = Map.empty<Nat, StayRecord>();
  let bookingRequests = Map.empty<Nat, BookingRequest>();
  let hotelVisibility = Map.empty<Principal, HotelVisibility>();
  let reviews = Map.empty<Nat, Review>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let inviteState = InviteLinksModule.initState();

  var isAccessControlInitialized : Bool = false;
  var nextId = 1;
  var isTestingModeEnabled : Bool = false;

  // Health check endpoint implementation
  public query ({ caller }) func health() : async HealthStatus {
    {
      ok = true;
      timestamp = Time.now();
    };
  };

  public shared ({ caller }) func setTestingMode(enabled : Bool) : async () {
    checkAdminPermission(caller);
    isTestingModeEnabled := enabled;
  };

  public query ({ caller }) func getTestingMode() : async Bool {
    checkAuthenticated(caller);
    isTestingModeEnabled;
  };

  func isHotelBookable(hotelPrincipal : Principal) : Bool {
    switch (hotelVisibility.get(hotelPrincipal)) {
      case (?visibility) {
        visibility.isActive and visibility.isPaid and not visibility.isDummyHotel
      };
      case (_) { false };
    };
  };

  func isHotelVisibleToGuests(hotelPrincipal : Principal, isTestingMode : Bool) : Bool {
    switch (hotelVisibility.get(hotelPrincipal)) {
      case (?visibility) {
        if (not (visibility.isActive and visibility.isPaid)) {
          return false;
        };
        if (not isTestingMode and visibility.isDummyHotel) {
          return false;
        };
        true;
      };
      case (_) { false };
    };
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    checkAdminPermission(caller);
    let code = "TODO_no_random_generation_in_templates";
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    checkAuthenticated(caller);
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    checkAdminPermission(caller);
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    checkAdminPermission(caller);
    InviteLinksModule.getInviteCodes(inviteState);
  };

  public query ({ caller }) func adminRecoveryDiagnostics() : async AdminRecoveryDiagnostics {
    checkAdminPermission(caller);
    {
      caller;
      callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
      accessControlInitialized = isAccessControlInitialized;
    };
  };

  public shared ({ caller }) func restoreAdminAccess(userProvidedToken : Text) : async () {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return;
    };
    AccessControl.initialize(accessControlState, caller, "ADMIN_TOKEN", userProvidedToken);
    isAccessControlInitialized := true;
  };

  public query ({ caller }) func getAccountStatus() : async AccountStatus {
    checkAuthenticated(caller);
    {
      callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
      callerIsInvited = isAuthorizedForHotelOperations(caller);
      userProfileExists = userProfiles.containsKey(caller);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkAuthenticated(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkProfileOwnership(caller, user);
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkAuthenticated(caller);
    userProfiles.add(caller, profile);
  };

  func isAuthorizedForHotelOperations(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (invitedPrincipals.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  public shared ({ caller }) func saveHotelProfile(profile : HotelProfile) : async () {
    checkHotelOperationsAuthorization(caller);
    hotelProfiles.add(caller, profile);

    switch (hotelVisibility.get(caller)) {
      case (null) {
        let defaultVisibility : HotelVisibility = {
          var isDummyHotel = true;
          var isActive = false;
          var isPaid = true;
        };
        hotelVisibility.add(caller, defaultVisibility);
      };
      case (?_) { () };
    };
  };

  public shared ({ caller }) func updateRoomInventory(hotelPrincipal : Principal, room : RoomInventory) : async () {
    checkHotelOperationsAuthorization(caller);

    // Non-admin users can only update their own hotel's inventory
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      checkHotelInventoryOwnership(caller, hotelPrincipal);
    };

    switch (hotelProfiles.get(hotelPrincipal)) {
      case (null) { Runtime.trap("Invalid hotel: Hotel profile does not exist") };
      case (?profile) {
        let existingRooms = profile.rooms;
        var roomsList = existingRooms.toVarArray<RoomInventory>();

        switch (roomsList.findIndex(func(r) { r.roomType == room.roomType })) {
          case (?index) {
            roomsList[index] := room;
          };
          case (null) {
            let newRooms = roomsList.toArray().concat([room]);
            roomsList := newRooms.toVarArray<RoomInventory>();
          };
        };

        let updatedProfile = {
          profile with
          rooms = roomsList.toArray();
        };
        hotelProfiles.add(hotelPrincipal, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func deleteRoomInventory(hotelPrincipal : Principal, roomType : Text) : async () {
    checkHotelOperationsAuthorization(caller);

    // Non-admin users can only delete from their own hotel's inventory
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      checkHotelInventoryOwnership(caller, hotelPrincipal);
    };

    switch (hotelProfiles.get(hotelPrincipal)) {
      case (null) { Runtime.trap("Invalid hotel: Hotel profile does not exist") };
      case (?profile) {
        let filteredRooms = profile.rooms.filter(func(r) { r.roomType != roomType });
        let updatedProfile = {
          profile with
          rooms = filteredRooms;
        };
        hotelProfiles.add(hotelPrincipal, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getHotelProfile(hotelPrincipal : Principal) : async ?HotelProfile {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnHotel = (caller == hotelPrincipal) and isAuthorizedForHotelOperations(caller);
    let isVisibleToGuests = isHotelVisibleToGuests(hotelPrincipal, isTestingModeEnabled);

    if (not (isAdmin or isOwnHotel or isVisibleToGuests)) {
      return null;
    };

    hotelProfiles.get(hotelPrincipal);
  };

  public query ({ caller }) func getAllHotelsWithPrincipals() : async [HotelProfileWithPrincipal] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let filteredHotels = if (isAdmin) {
      hotelProfiles.toArray();
    } else {
      hotelProfiles.toArray().filter(
        func((hotelPrincipal, _profile)) {
          isHotelVisibleToGuests(hotelPrincipal, isTestingModeEnabled)
        }
      );
    };

    filteredHotels.map<(Principal, HotelProfile), HotelProfileWithPrincipal>(
      func((principal, profile)) { { principal; profile } }
    );
  };

  public query ({ caller }) func getHotelsByCountry(country : Text) : async [HotelProfile] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let filteredHotels = if (isAdmin) {
      hotelProfiles.toArray();
    } else {
      hotelProfiles.toArray().filter(
        func((hotelPrincipal, _profile)) {
          isHotelVisibleToGuests(hotelPrincipal, isTestingModeEnabled)
        }
      );
    };

    let countryHotels = filteredHotels;
    let filteredCountryHotels = countryHotels.filter(
      func((_hotelPrincipal, profile)) { profile.country == country }
    );

    filteredCountryHotels.map<(Principal, HotelProfile), HotelProfile>(
      func((hotelPrincipal, profile)) { profile }
    );
  };

  public shared ({ caller }) func createPaymentRequest(amount : Nat, id : Text, reference : Text, option : PaymentOption) : async Text {
    checkAuthenticated(caller);
    let paymentRequest : PaymentRequest = {
      id;
      user = caller;
      amount;
      reference;
      option;
      status = #pending;
    };
    paymentRequests.add(id, paymentRequest);
    reference;
  };

  public shared ({ caller }) func confirmPaymentRequest(id : Text) : async () {
    checkAdminPermission(caller);
    switch (paymentRequests.get(id)) {
      case (null) { Runtime.trap("No such payment request") };
      case (?request) {
        let updatedRequest = { request with status = #confirmed };
        paymentRequests.add(id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func rejectPaymentRequest(id : Text) : async () {
    checkAdminPermission(caller);
    switch (paymentRequests.get(id)) {
      case (null) { Runtime.trap("No such payment request") };
      case (?request) {
        let updatedRequest = { request with status = #rejected };
        paymentRequests.add(id, updatedRequest);
      };
    };
  };

  public query ({ caller }) func getPaymentRequest(id : Text) : async PaymentRequest {
    switch (paymentRequests.get(id)) {
      case (null) { Runtime.trap("No such payment request") };
      case (?request) {
        if (request.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own payment requests");
        };
        request;
      };
    };
  };

  public query ({ caller }) func getAllPaymentRequests() : async [PaymentRequest] {
    checkAdminPermission(caller);
    paymentRequests.values().toArray();
  };

  public shared ({ caller }) func generateHotelInviteToken(token : Text) : async Text {
    checkAdminPermission(caller);
    let inviteToken : InviteToken = {
      token;
      isConsumed = false;
    };
    inviteTokens.add(token, inviteToken);
    token;
  };

  public query ({ caller }) func checkInviteToken(token : Text) : async Bool {
    checkAuthenticated(caller);
    switch (inviteTokens.get(token)) {
      case (null) { false };
      case (?inviteToken) { not inviteToken.isConsumed };
    };
  };

  public shared ({ caller }) func consumeInviteToken(token : Text) : async Bool {
    checkAuthenticated(caller);
    switch (inviteTokens.get(token)) {
      case (null) { false };
      case (?inviteToken) {
        if (inviteToken.isConsumed) {
          false;
        } else {
          let updatedToken = { inviteToken with isConsumed = true };
          inviteTokens.add(token, updatedToken);
          invitedPrincipals.add(caller, true);
          true;
        };
      };
    };
  };

  public query ({ caller }) func getAllInviteTokens() : async [InviteToken] {
    checkAdminPermission(caller);
    inviteTokens.values().toArray();
  };

  public query ({ caller }) func isCallerInvited() : async Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (invitedPrincipals.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  public shared ({ caller }) func createStayRecord(input : CreateStayRecordInput) : async Nat {
    checkHotelOperationsAuthorization(caller);

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      checkHotelInventoryOwnership(caller, input.hotel);
    };

    let actualHotelName = switch (hotelProfiles.get(input.hotel)) {
      case (null) { Runtime.trap("Invalid hotel: Hotel profile does not exist") };
      case (?profile) { profile.name };
    };

    // Verify the guest principal is valid (not anonymous)
    if (input.guest.isAnonymous()) {
      Runtime.trap("Invalid guest: Cannot create stay record for anonymous principal");
    };

    // AUTHORIZATION FIX: Verify that a confirmed booking exists for this guest-hotel combination
    // This prevents hotels from creating fake stay records for arbitrary guests
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      let hasConfirmedBooking = bookingRequests.values().any(
        func(booking : BookingRequest) : Bool {
          booking.guest == input.guest and 
          booking.hotel == input.hotel and 
          booking.status == #confirmed
        }
      );
      
      if (not hasConfirmedBooking) {
        Runtime.trap("Unauthorized: Cannot create stay record without a confirmed booking for this guest");
      };
    };

    let stayRecord : StayRecord = {
      id = nextId;
      guest = input.guest;
      hotel = input.hotel;
      hotelName = actualHotelName;
      checkInDate = input.checkInDate;
      checkOutDate = input.checkOutDate;
      createdAt = Time.now();
    };

    stayRecords.add(nextId, stayRecord);
    nextId += 1;
    stayRecord.id;
  };

  public query ({ caller }) func getCallerStayHistory() : async [StayRecord] {
    checkAuthenticated(caller);
    let callerStayIter = stayRecords.values().filter(func(record) { record.guest == caller });
    let callerStay = callerStayIter.toArray();

    callerStay.sort(
      func(a, b) {
        Nat.compare(
          b.createdAt.toNat(),
          a.createdAt.toNat(),
        );
      }
    );
  };

  public shared ({ caller }) func createBookingRequest(input : CreateBookingInput) : async Nat {
    checkAuthenticated(caller);

    // Only allow bookings for hotels that are visible to guests (isPaid, isActive, !isDummyHotel) or if they are dummy hotels in testing mode.
    if (not isHotelVisibleToGuests(input.hotel, isTestingModeEnabled)) {
      switch (hotelVisibility.get(input.hotel)) {
        case (?visibility) {
          if (visibility.isDummyHotel and not isTestingModeEnabled) {
            Runtime.trap("Testing mode required: Booking test/dummy hotels requires testing mode. No real booking will be created.");
          } else if (not visibility.isPaid) {
            Runtime.trap("Unpaid Hotel: This hotel has not yet paid the onboarding fee. Please contact us if a hotel should be available.");
          } else if (not visibility.isActive) {
            Runtime.trap("Inactive Hotel: This hotel has not yet been activated. Please contact us if you think there is a mistake.");
          } else {
            Runtime.trap("Invalid hotel configuration");
          };
        };
        case (_) {
          Runtime.trap("Hotel not found: The hotel you selected could not be found.");
        };
      };
    };

    let actualHotelName = switch (hotelProfiles.get(input.hotel)) {
      case (null) { Runtime.trap("Hotel not found: The hotel you selected could not be found.") };
      case (?profile) { profile.name };
    };

    if (input.guests == 0) {
      Runtime.trap("Invalid guests: Cannot create booking with 0 guests");
    };

    if (input.checkInDate < Time.now() + 100_000_000) {
      Runtime.trap("Invalid check-in date: Must be in the future");
    };

    if (input.checkOutDate <= input.checkInDate) {
      Runtime.trap("Invalid stay period: Check-out date must be after check-in date.");
    };

    if (input.room_type == "") {
      Runtime.trap("Invalid room selection: Room type must be chosen when making a booking.");
    };

    let bookingRequest : BookingRequest = {
      id = nextId;
      guest = caller;
      hotel = input.hotel;
      hotelName = actualHotelName;
      room_type = input.room_type;
      checkInDate = input.checkInDate;
      checkOutDate = input.checkOutDate;
      guests = input.guests;
      status = #pending;
      createdAt = Time.now();
      lastUpdated = Time.now();
    };

    bookingRequests.add(nextId, bookingRequest);
    nextId += 1;
    bookingRequest.id;
  };

  public shared ({ caller }) func cancelBooking(id : Nat) : async () {
    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("No such booking request") };
      case (?request) {
        if (caller != request.guest) {
          Runtime.trap("Unauthorized: Can only cancel your own bookings");
        };
        let updatedRequest = { request with status = #cancelled; lastUpdated = Time.now() };
        bookingRequests.add(id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func cancelHotelBooking(id : Nat) : async () {
    checkHotelOperationsAuthorization(caller);

    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("No such booking request") };
      case (?request) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          checkHotelInventoryOwnership(caller, request.hotel);
        };
        let updatedRequest = { request with status = #cancelled; lastUpdated = Time.now() };
        bookingRequests.add(id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func deleteHotelBooking(id : Nat) : async () {
    checkHotelOperationsAuthorization(caller);

    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("No such booking request") };
      case (?request) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          checkHotelInventoryOwnership(caller, request.hotel);
        };
        bookingRequests.remove(id);
      };
    };
  };

  public shared ({ caller }) func confirmBooking(id : Nat) : async () {
    checkHotelOperationsAuthorization(caller);

    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("No such booking request") };
      case (?request) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          checkHotelInventoryOwnership(caller, request.hotel);
        };
        let updatedRequest = { request with status = #confirmed; lastUpdated = Time.now() };
        bookingRequests.add(id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func rejectBooking(id : Nat) : async () {
    checkHotelOperationsAuthorization(caller);

    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("No such booking request") };
      case (?request) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          checkHotelInventoryOwnership(caller, request.hotel);
        };
        let updatedRequest = { request with status = #rejected; lastUpdated = Time.now() };
        bookingRequests.add(id, updatedRequest);
      };
    };
  };

  public query ({ caller }) func getBookingRequest(id : Nat) : async BookingRequest {
    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("No such booking request") };
      case (?request) {
        let isGuest = request.guest == caller;
        let isHotel = request.hotel == caller and isAuthorizedForHotelOperations(caller);
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not (isGuest or isHotel or isAdmin)) {
          Runtime.trap("Unauthorized: Can only view your own booking requests or bookings for your hotel");
        };
        request;
      };
    };
  };

  public query ({ caller }) func getAllBookingRequests() : async [BookingRequest] {
    checkAdminPermission(caller);
    bookingRequests.values().toArray();
  };

  public query ({ caller }) func getCallerPendingBookings() : async [BookingRequest] {
    checkAuthenticated(caller);
    let callerBookings = bookingRequests.values().filter(func(record) { record.guest == caller and record.status == #pending });
    callerBookings.toArray();
  };

  public query ({ caller }) func getCallerProcessingBookings() : async [BookingRequest] {
    checkAuthenticated(caller);
    let callerBookings = bookingRequests.values().filter(func(record) { record.guest == caller and (record.status == #pending or record.status == #confirmed) });
    callerBookings.toArray();
  };

  // Update here: get all relevant hotel bookings, not only #pending
  public query ({ caller }) func getHotelBookings() : async [BookingRequest] {
    checkHotelOperationsAuthorization(caller);

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return bookingRequests.values().toArray();
    };

    let hotelBookings = bookingRequests.values().filter(
      func(record) { record.hotel == caller and (record.status == #pending or record.status == #confirmed) }
    );
    hotelBookings.toArray();
  };

  public query ({ caller }) func getHotelPendingBookings() : async [BookingRequest] {
    checkHotelOperationsAuthorization(caller);

    if (AccessControl.isAdmin(accessControlState, caller)) {
      let pendingBookings = bookingRequests.values().filter(func(record) { record.status == #pending });
      return pendingBookings.toArray();
    };

    let hotelPendingBookings = bookingRequests.values().filter(func(record) { record.hotel == caller and record.status == #pending });
    hotelPendingBookings.toArray();
  };

  func getSafePersistentView(hotel : Principal) : PersistentHotelVisibility {
    switch (hotelVisibility.get(hotel)) {
      case (?vis) {
        {
          isDummyHotel = vis.isDummyHotel;
          isActive = vis.isActive;
          isPaid = vis.isPaid;
        };
      };
      case (null) {
        { isDummyHotel = false; isActive = true; isPaid = true };
      };
    };
  };

  public shared ({ caller }) func setHotelVisibility(hotel : Principal, isActive : Bool, isDummyHotel : Bool) : async () {
    checkAdminPermission(caller);

    let defaultVisibility : HotelVisibility = {
      var isDummyHotel = false;
      var isActive = true;
      var isPaid = true;
    };

    let visibility : HotelVisibility = {
      var isPaid = switch (hotelVisibility.get(hotel)) {
        case (?existing) { existing.isPaid };
        case (null) { defaultVisibility.isPaid };
      };
      var isDummyHotel;
      var isActive;
    };

    hotelVisibility.add(hotel, visibility);
  };

  public shared ({ caller }) func setHotelPaymentStatus(hotel : Principal, isPaid : Bool) : async () {
    checkAdminPermission(caller);

    let defaultVisibility : HotelVisibility = {
      var isDummyHotel = false;
      var isActive = true;
      var isPaid = true;
    };

    let visibility : HotelVisibility = {
      var isActive = switch (hotelVisibility.get(hotel)) {
        case (?existing) { existing.isActive };
        case (null) { defaultVisibility.isActive };
      };
      var isDummyHotel = switch (hotelVisibility.get(hotel)) {
        case (?existing) { existing.isDummyHotel };
        case (null) { defaultVisibility.isDummyHotel };
      };
      var isPaid;
    };

    hotelVisibility.add(hotel, visibility);
  };

  public query ({ caller }) func getHotelVisibility(hotel : Principal) : async PersistentHotelVisibility {
    checkAdminPermission(caller);
    getSafePersistentView(hotel);
  };

  public query ({ caller }) func adminGetAllHotelVisibilityStats() : async [AdminHotelVisibilityView] {
    checkAdminPermission(caller);

    hotelProfiles.toArray().map<(Principal, HotelProfile), AdminHotelVisibilityView>(
      func((hotel, profile)) {
        {
          hotel;
          profile = ?profile;
          visibility = getSafePersistentView(hotel);
        };
      }
    );
  };

  public shared ({ caller }) func submitReview(input : ReviewInput) : async Nat {
    checkAuthenticated(caller);

    if (input.rating < 1 or input.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let review : Review = {
      id = nextId;
      reviewer = caller;
      targetType = input.targetType;
      targetId = input.targetId;
      rating = input.rating;
      comment = input.comment;
      createdAt = Time.now();
    };

    reviews.add(nextId, review);
    nextId += 1;
    review.id;
  };

  public query ({ caller }) func getReview(id : Nat) : async ?Review {
    checkAuthenticated(caller);
    reviews.get(id);
  };

  public query ({ caller }) func getReviewsByTarget(targetType : Text, targetId : Principal) : async [Review] {
    checkAuthenticated(caller);
    reviews.values().toArray().filter(
      func(review) { review.targetType == targetType and review.targetId == targetId }
    );
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    checkAuthenticated(caller);
    reviews.values().toArray();
  };

  func checkAuthenticated(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot perform this action");
    };
  };

  func checkAdminPermission(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func checkHotelOperationsAuthorization(caller : Principal) {
    if (not isAuthorizedForHotelOperations(caller)) {
      Runtime.trap("Unauthorized: Only admins or hotels with authorization can perform this action");
    };
  };

  func checkProfileOwnership(caller : Principal, user : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous cannot access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only access your own profiles or as admin");
    };
  };

  func checkHotelInventoryOwnership(requestor : Principal, owner : Principal) {
    if (requestor != owner) {
      Runtime.trap("Unauthorized: Can only access your own hotel inventory");
    };
  };
};

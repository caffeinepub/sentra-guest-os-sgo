import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import List "mo:core/List";

module {
  type OldRoomInventory = {
    roomType : Text;
    pricePerNight : Nat;
    promo : ?Text;
    photos : [Text];
  };

  type OldHotelProfile = {
    name : Text;
    classification : {
      #fiveStar;
      #fourStar;
      #threeStar;
      #twoStar;
      #oneStar;
      #jasmine;
    };
    location : {
      address : Text;
      mapLink : Text;
    };
    country : Text;
    logo : ?Text;
    rooms : [OldRoomInventory];
  };

  type OldBookingRequest = {
    id : Nat;
    guest : Principal;
    hotel : Principal;
    hotelName : Text;
    checkInDate : Int;
    checkOutDate : Int;
    guests : Nat;
    status : {
      #pending;
      #confirmed;
      #rejected;
      #cancelled;
    };
    createdAt : Int;
    lastUpdated : Int;
  };

  type OldActor = {
    hotelProfiles : Map.Map<Principal, OldHotelProfile>;
    bookingRequests : Map.Map<Nat, OldBookingRequest>;
  };

  type NewRoomInventory = {
    roomType : Text;
    pricePerNight : Nat;
    promo : ?Text;
    photos : [Text];
    currency : {
      #IDR;
      #USD;
      #EUR;
      #SGD;
    };
  };

  type NewHotelProfile = {
    name : Text;
    classification : {
      #fiveStar;
      #fourStar;
      #threeStar;
      #twoStar;
      #oneStar;
      #jasmine;
    };
    location : {
      address : Text;
      mapLink : Text;
    };
    country : Text;
    logo : ?Text;
    rooms : [NewRoomInventory];
    payment_instructions : ?Text;
  };

  type NewBookingRequest = {
    id : Nat;
    guest : Principal;
    hotel : Principal;
    hotelName : Text;
    room_type : Text;
    checkInDate : Int;
    checkOutDate : Int;
    guests : Nat;
    status : {
      #pending;
      #confirmed;
      #rejected;
      #cancelled;
    };
    createdAt : Int;
    lastUpdated : Int;
  };

  type NewActor = {
    hotelProfiles : Map.Map<Principal, NewHotelProfile>;
    bookingRequests : Map.Map<Nat, NewBookingRequest>;
  };

  func migrateOldRoomToNew(oldRoom : OldRoomInventory) : NewRoomInventory {
    { oldRoom with currency = #IDR };
  };

  public func run(old : OldActor) : NewActor {
    let migratedHotels = old.hotelProfiles.map<Principal, OldHotelProfile, NewHotelProfile>(
      func(_p, oldHotel) {
        let newHotel = {
          oldHotel with
          payment_instructions = null;
          rooms = List.fromArray<OldRoomInventory>(oldHotel.rooms).map<OldRoomInventory, NewRoomInventory>(
            migrateOldRoomToNew
          ).toArray();
        };
        newHotel;
      }
    );
    let migratedBookings = old.bookingRequests.map<Nat, OldBookingRequest, NewBookingRequest>(
      func(_id, oldBooking) {
        { oldBooking with room_type = "" };
      }
    );

    {
      hotelProfiles = migratedHotels;
      bookingRequests = migratedBookings;
    };
  };
};

import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";

actor {
  type Message = {
    id : Nat;
    role : Text; // "user" or "assistant"
    content : Text;
    timestamp : Int;
  };

  type Guarantee = {
    code : Text;
    risque : Text;
    service : Text;
    intervention : Text;
    montant : Nat;
    pourcentage : Nat;
  };

  type FamilyMember = {
    nom : Text;
    antecedents : Text;
    formule : Text;
    maladieY : Bool;
    maladies : Text;
    stade : Text;
    dateNaissance : Text;
    garantir : Text;
  };

  type Policy = {
    numero : Text;
    type_ : Text;
    statut : Text;
    couverture : {
      hospitalisation : Nat;
      maladiesGraves : Nat;
      soinsAmbulatoires : Nat;
    };
    famille : [FamilyMember];
    garanties : [Guarantee];
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  type ChatSession = {
    messages : List.List<Message>;
    isActive : Bool;
  };

  let chatSessions = Map.empty<Principal, ChatSession>();
  let policyData = Map.empty<Text, Policy>();

  let defaultGuarantees = [
    {
      code = "G01";
      risque = "Hospitalisation";
      service = "Ambulance";
      intervention = "Transport";
      montant = 500;
      pourcentage = 80;
    },
    {
      code = "G02";
      risque = "Maladies graves";
      service = "Chirurgie";
      intervention = "Opération";
      montant = 1000;
      pourcentage = 90;
    },
  ];

  let defaultFamilyMembers = [
    {
      nom = "John Doe";
      formule = "Standard";
      maladieY = false;
      maladies = "";
      antecedents = "Asthme";
      stade = "";
      dateNaissance = "1980-01-01";
      garantir = "Oui";
    },
    {
      nom = "Jane Doe";
      formule = "Premium";
      maladieY = true;
      maladies = "Diabète";
      antecedents = "";
      stade = "Stade 1";
      dateNaissance = "1985-05-10";
      garantir = "Oui";
    },
  ];

  let defaultPolicy : Policy = {
    numero = "POL123456";
    type_ = "Collective B2B";
    statut = "Actif";
    couverture = {
      hospitalisation = 90;
      maladiesGraves = 85;
      soinsAmbulatoires = 80;
    };
    famille = defaultFamilyMembers;
    garanties = defaultGuarantees;
  };

  public shared ({ caller }) func initializePolicy(numero : Text) : async () {
    if (policyData.containsKey(numero)) { return };
    policyData.add(numero, defaultPolicy);
  };

  public query ({ caller }) func getFamilyMembers(policyNumber : Text) : async [FamilyMember] {
    switch (policyData.get(policyNumber)) {
      case (?policy) { policy.famille };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getGuarantees(policyNumber : Text) : async [Guarantee] {
    switch (policyData.get(policyNumber)) {
      case (?policy) { policy.garanties };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getPolicyDetails(policyNumber : Text) : async ?Policy {
    policyData.get(policyNumber);
  };

  func generateBotReply(content : Text) : Message {
    let timestamp = Time.now();
    let lowerContent = content.toLower();
    var replyContent = "Sorry, ik heb uw vraag niet goed begrepen. Kunt u meer informatie geven? Ontdek onze ziektekostenverzekering met volledige gezinsdekking en solide garanties.";

    if (lowerContent.contains(#text "hospit")) {
      replyContent := "Onze ziektekostenverzekering dekt eenpersoonskamers in het ziekenhuis en chirurgische ingrepen.";
    } else if (lowerContent.contains(#text "gezin") or lowerContent.contains(#text "famil")) {
      replyContent := "Wij bieden gezinsformules aan voor u en uw naasten.";
    } else if (lowerContent.contains(#text "garanti")) {
      replyContent := "Onze garanties omvatten heelkunde, ziekenhuiszorg en spoedinterventies.";
    } else if (lowerContent.contains(#text "polis")) {
      replyContent := "Uw polisnummer vindt u terug in de verzekeringsdocumenten die u heeft ontvangen.";
    } else if (lowerContent.contains(#text "premie") or lowerContent.contains(#text "prijs") or lowerContent.contains(#text "kost")) {
      replyContent := "Onze tarieven zijn competitief en afgestemd op uw behoeften.";
    };

    {
      id = timestamp.toNat();
      role = "bot";
      content = replyContent;
      timestamp;
    };
  };

  public shared ({ caller }) func sendMessage(content : Text) : async Message {
    let timestamp = Time.now();
    let userMessage : Message = {
      id = timestamp.toNat();
      role = "user";
      content;
      timestamp;
    };

    let botReply = generateBotReply(content);

    let session = switch (chatSessions.get(caller)) {
      case (null) {
        {
          messages = List.fromArray<Message>([]);
          isActive = true;
        };
      };
      case (?existingSession) { existingSession };
    };

    session.messages.add(userMessage);
    session.messages.add(botReply);

    chatSessions.add(caller, session);
    botReply;
  };

  public query ({ caller }) func getChatMessages() : async [Message] {
    switch (chatSessions.get(caller)) {
      case (null) { [] };
      case (?session) {
        session.messages.toArray().sort();
      };
    };
  };

  public shared ({ caller }) func resetChatForUser(user : Principal) : async () {
    chatSessions.remove(user);
  };

  public shared ({ caller }) func addPolicy(numero : Text, policy : Policy) : async () {
    if (policyData.containsKey(numero)) { return };
    policyData.add(numero, policy);
  };
};

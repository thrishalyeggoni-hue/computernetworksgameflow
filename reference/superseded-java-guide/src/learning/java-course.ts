/** Original teaching notes mapped to the official theory course. Network examples are analogies, not claims about this TypeScript implementation. */
export interface Topic {
  title: string;
  plain: string;
  java: string;
  connection: string;
  watch: string;
}
export interface JavaUnit {
  id: number;
  title: string;
  question: string;
  idea: string;
  topics: Topic[];
  example: {
    title: string;
    file: string;
    code: string;
    output: string;
    walk: string[];
  };
  revision: string[];
  check: { question: string; answer: string };
  scene: { scenario: string; page: string; instruction: string };
}
export const javaSyllabus = {
  institution: "VNRVJIET",
  regulation: "R25",
  branch: "CSE (Cyber Security)",
  semester: "II year · III semester",
  course: "Object Oriented Programming Through Java",
  code: "25PC1CS201",
  credits: 3,
  source:
    "https://www.vnrvjiet.ac.in/__l5e/assets-v1/d9ef8b4d-3050-4e88-b889-d240c02d2b53/II-B.Tech-CYS-R25.pdf#page=5",
  pages: "Printed pages 5–6",
  kind: "Classroom theory",
  checked: "22 October 2026",
};
const t = (
  title: string,
  plain: string,
  java: string,
  connection: string,
  watch: string,
): Topic => ({ title, plain, java, connection, watch });
export const javaUnits: JavaUnit[] = [
  {
    id: 1,
    title: "Java basics & thinking in objects",
    question: "How do I turn a real thing into a program?",
    idea: "Think of a parcel. It has information, such as a message, and actions, such as reading that message. OOP keeps related information and actions together so a large program is easier to reason about.",
    topics: [
      t(
        "Why OOP? Objects, abstraction & encapsulation",
        "A TV remote gives you useful buttons without exposing its wiring. A well-designed object does the same: a small, clear way to use something complicated.",
        "An object combines state and behavior. A class describes how such objects are built. Abstraction highlights the essential operations; encapsulation groups state with operations and controls access.",
        "Treat a computer, router, and parcel as separate responsibilities. The Send button hides encoding, scheduling, and forwarding details.",
        "Java encapsulation and network encapsulation are different concepts. One controls software state; the other wraps data in protocol headers.",
      ),
      t(
        "A simple program, types & variables",
        "A variable is a named place for a value. Its type tells Java which kinds of value and operations are allowed.",
        "A conventional entry point is public static void main(String[] args). Primitive types are byte, short, int, long, float, double, char, and boolean. String is a reference type.",
        "A Java teaching model could use int ttl, boolean linkUp, and String message for the values you inspect here.",
        "A Java char is one UTF-16 code unit, not necessarily one complete visible character. The simulator counts UTF-8 bytes separately.",
      ),
      t(
        "Scope & lifetime",
        "Scope asks “where may I use this name?” Lifetime asks “how long does this value or object exist?”",
        "A local variable belongs to a block or method invocation. An instance field belongs to an object. A static field belongs to the class. An object can survive the method that created it if a reachable reference remains.",
        "A packet’s fields should survive while that packet is being processed; a temporary hop calculation can be local to a method.",
        "Leaving a method does not automatically destroy every object created inside it.",
      ),
      t(
        "Arrays",
        "An array is a row of numbered lockers. Each locker holds a value of the declared element type.",
        "Java arrays have fixed length, zero-based indices, and a length field. byte[] can hold message bytes; Device[] can hold device references.",
        "A Java version could keep message bytes in byte[] and process them in sequence.",
        "Index length is out of bounds. For an array of length 3, valid indices are 0, 1, and 2.",
      ),
      t(
        "Operators, expressions & control flow",
        "Operators do work with values. Conditions choose a path. Loops repeat a step.",
        "Arithmetic, relational, logical, assignment, and bitwise operators build expressions. if, switch, for, while, and do-while control execution.",
        "“If the link is down, report a failure; otherwise send” is a condition. Visiting each packet is a loop.",
        "Assignment (=) and equality (==) serve different purposes. A loop needs a condition that can eventually become false.",
      ),
      t(
        "Conversion & casting",
        "Some containers can safely hold a smaller kind of value. Squeezing a large value into a smaller container may lose information.",
        "Widening conversions often happen automatically; narrowing generally requires an explicit cast. Reference casts change the type through which a reference is viewed and can fail at runtime.",
        "Converting a byte count to double helps calculate a non-integer goodput.",
        "A cast does not guarantee safety: (int) 3.9 becomes 3. Casting is not a way to fix an object of an unrelated type.",
      ),
      t(
        "Classes, objects & constructors",
        "A class is the design for a parcel. An object is one actual parcel made from that design. A constructor fills in its starting details.",
        "new creates an object and invokes a constructor. Constructors have the class name and no return type. Different objects can hold different field values.",
        "Two parcels can share the same design yet have different messages and IDs.",
        "A constructor is not an ordinary method with a void return type. Java supplies a default no-argument constructor only when no constructor is declared.",
      ),
      t(
        "Methods, access control & this",
        "A method is a job an object knows how to do. Access control decides who may ask for or change its details.",
        "Methods specify behavior. private restricts direct access; public exposes a member. this refers to the current object and can distinguish a field from a parameter of the same name.",
        "A Java Parcel might keep message private and expose readMessage(). Sending a parcel would not require directly editing its internals.",
        "private by itself is not encryption. It is a programming access rule.",
      ),
      t(
        "Garbage collection",
        "When no reachable part of a program can use an object anymore, Java can reclaim its memory.",
        "Garbage collection manages unreachable object memory. Its timing is not guaranteed. Files, sockets, and database connections still need explicit resource management.",
        "A Java version should release closed experiment resources rather than assuming a memory collector will close everything.",
        "Setting one reference to null does not delete an object that other reachable references still point to.",
      ),
      t(
        "Method & constructor overloading",
        "One service can have several forms: make a parcel with a default message, or make one with your chosen message.",
        "Overloads share a name but differ in parameter lists. Constructors can also be overloaded. Return type alone cannot distinguish overloads.",
        "send(String message) and send(String message, int ttl) could be two Java method overloads.",
        "Overloading is selected using compile-time information; overriding is a different topic in Unit II.",
      ),
      t(
        "Recursion",
        "A job may solve a smaller version of itself until it reaches an easy stopping case.",
        "A recursive method calls itself. It needs a base case and progress toward that base case. Each call uses stack space.",
        "Explaining a route recursively is possible, but an endlessly repeating route is not a successful recursive solution.",
        "A missing stopping case can lead to StackOverflowError. Packet TTL is a network safeguard, not Java’s recursion base case.",
      ),
      t(
        "Nested classes, String & wrapper types",
        "Sometimes a helper belongs closely to another class. Text and boxed numbers are useful everyday objects too.",
        "A static nested class needs no enclosing instance; an inner class is tied to an enclosing object. String is immutable. Wrapper classes such as Integer box primitive values into objects.",
        "A Java teaching model could define a helper inside a simulation class, keep message text in String, and use List<Integer> for boxed numbers.",
        "String length, Unicode character count, and UTF-8 byte count can differ. Changing a String variable may create or refer to another String; it does not mutate the original text.",
      ),
    ],
    example: {
      title: "One design, two actual parcels",
      file: "UnitOneDemo.java",
      code: `public class UnitOneDemo {
    static class Parcel {
        private String message;
        Parcel(String message) { this.message = message; }
        String readMessage() { return message; }
    }
    public static void main(String[] args) {
        Parcel first = new Parcel("Hello");
        Parcel second = new Parcel("Welcome");
        System.out.println(first.readMessage());
        System.out.println(second.readMessage());
    }
}`,
      output: "Hello\nWelcome",
      walk: [
        "Parcel is the design; first and second refer to two different objects.",
        "The constructor stores its argument in that object’s message field.",
        "this.message names the field; message alone names the constructor parameter.",
        "readMessage() is an operation supplied by the object.",
      ],
    },
    revision: [
      "Explain class versus object with two distinct instances.",
      "Differentiate abstraction, encapsulation, and access control.",
      "Trace a small program with a constructor, loop, overload, or recursive call.",
      "Explain scope, object lifetime, String immutability, wrappers, and nested classes.",
    ],
    check: {
      question:
        "If first and second use the same Parcel class, must they contain the same message?",
      answer:
        "No. A class supplies the design; each instance can have its own field values. In this example one object stores Hello and the other stores Welcome.",
    },
    scene: {
      scenario: "delivery",
      page: "Packet Fields",
      instruction:
        "Send a message and inspect two different packet IDs. Use their shared fields and different values as an analogy for class versus object.",
    },
  },
  {
    id: 2,
    title: "Reuse, contracts & flexible types",
    question: "How can different things follow a common design?",
    idea: "A school can have one common set of rules while each classroom works differently. Java uses inheritance and interfaces to share structure or promises, and polymorphism to select the right implementation.",
    topics: [
      t(
        "Inheritance & hierarchical abstraction",
        "A more specific kind can reuse suitable features of a more general kind. A router can be modeled as one kind of network device.",
        "A subclass uses extends with one direct superclass. It can add members and override suitable methods. Constructors are not inherited.",
        "An illustrative Java model could have Device as a parent of Router and Computer.",
        "An inheritance tree is a relationship between Java types, not a diagram of which network cable connects two devices.",
      ),
      t(
        "Six design roles of inheritance",
        "The syllabus names several reasons a designer might build an inheritance relationship. These are design ideas, not six Java commands.",
        "Specialization makes a more specific type; specification supplies a required shape; construction builds on existing structure; extension adds behavior; limitation constrains behavior; combination brings capabilities together.",
        "A specialized Router could extend a Device design; combining logging and forwarding capabilities is better illustrated with interfaces or composition.",
        "A restrictive subclass can break expectations of callers. Java still does not permit extending two classes at once.",
      ),
      t(
        "Member access & super",
        "A child does not receive permission to directly open every private drawer in the parent. super lets it explicitly refer to suitable parent behavior.",
        "public members are widely accessible, package access stays within the package, protected also supports subclass access under Java’s rules, and private members are not directly accessible to a subclass. super(...) invokes a superclass constructor; super.method() selects parent behavior.",
        "A Java Router constructor could call super(name) so Device initializes the common device name.",
        "Inherited behavior may use private parent state, but the child cannot simply access that state by name.",
      ),
      t(
        "final and inheritance",
        "final places a specific “do not replace this” rule on something. The rule depends on where the keyword appears.",
        "A final class cannot be extended. A final method cannot be overridden. A final variable can be assigned only once under Java’s assignment rules.",
        "An immutable ID reference or a deliberately fixed operation could use final in a Java design.",
        "A final reference does not automatically make the object it refers to immutable.",
      ),
      t(
        "Overriding & runtime polymorphism",
        "You can say “perform your job” to different workers, and each worker supplies its own version.",
        "An overriding instance method supplies subtype behavior. A superclass reference can refer to a subclass object; runtime dispatch chooses the applicable overriding implementation. @Override helps the compiler check the intention.",
        "Device d = new Router(); d.describe(); can select Router’s describe().",
        "Changing a method’s parameter list usually overloads it rather than overriding it. Static methods are hidden, not dynamically overridden.",
      ),
      t(
        "Abstract classes & Object",
        "A general plan can deliberately leave some jobs unfinished for specific types to complete.",
        "An abstract class cannot be directly instantiated and may contain both implemented and abstract methods. Object is the root of Java’s class hierarchy; its methods include toString(), equals(), and hashCode().",
        "An abstract Device could require each concrete subtype to describe itself.",
        "An abstract class may have fields and constructors. “Abstract” does not mean that every method lacks a body.",
      ),
      t(
        "Packages, imports & CLASSPATH",
        "Packages are named shelves for related Java types. The compiler or runtime must also know where those shelves can be found.",
        "package declares a namespace. import permits shorter type names; it does not paste source code. CLASSPATH is a search path for classes and resources in classpath-based applications.",
        "An illustrative Java project might separate network.model from network.ui.",
        "A package name and a classpath entry are different things. A source file’s folder alone does not replace its package declaration.",
      ),
      t(
        "Interfaces versus classes",
        "An interface is a promise about what a type can do. A class supplies an object design and its implementation.",
        "A class can implement multiple interfaces. An interface can extend multiple interfaces. Interfaces can contain abstract, default, static, and private methods as allowed by the Java language.",
        "Forwardable could promise forward(); Router supplies its concrete implementation.",
        "The word interface here means a Java type contract. The simulator’s Ethernet interface means a network port; these are different meanings.",
      ),
      t(
        "Interface variables & extending interfaces",
        "An interface can publish shared constants and build a more specific promise from existing promises.",
        "Interface fields are implicitly public static final. An interface that extends another inherits its applicable contract; a concrete implementing class must provide required behavior.",
        "A TraceableForwarder interface could extend Forwardable and add recordEvent().",
        "Interface fields are not separate mutable instance fields for every implementing object.",
      ),
      t(
        "Generic classes & methods",
        "A labeled box can promise to hold only one chosen kind of item, so a wrong item is caught early.",
        "Box<T> is a generic class. A method can declare its own type parameter, such as static <T> T identity(T value). Type arguments are reference types; use Integer rather than int.",
        "Box<Router> could hold a Router. Later, List<Parcel> can reject an unrelated String at compile time.",
        "Generics are Java type-safety tools, not a rule that all network packets have the same payload type.",
      ),
    ],
    example: {
      title: "One reference, a router’s behavior",
      file: "UnitTwoDemo.java",
      code: `public class UnitTwoDemo {
    interface Forwardable { void forward(); }
    static abstract class Device {
        final String name;
        Device(String name) { this.name = name; }
        abstract String describe();
    }
    static class Router extends Device implements Forwardable {
        Router(String name) { super(name); }
        @Override String describe() { return "Router " + name; }
        @Override public void forward() {
            System.out.println("Choose a next hop");
        }
    }
    static class Box<T> {
        final T value;
        Box(T value) { this.value = value; }
    }
    public static void main(String[] args) {
        Box<Router> box = new Box<>(new Router("R1"));
        Device device = box.value;
        System.out.println(device.describe());
        box.value.forward();
    }
}`,
      output: "Router R1\nChoose a next hop",
      walk: [
        "Router extends one class and implements a separate behavioral contract.",
        "super(name) initializes Device’s common name field.",
        "The variable device has type Device, but its object is a Router; the overriding method is selected.",
        "Box<Router> makes the chosen content type explicit.",
      ],
    },
    revision: [
      "Compare overloading with overriding, including when selection happens.",
      "Explain extends, implements, super, final, and abstract with a small hierarchy.",
      "Distinguish a package from CLASSPATH and an interface from a class.",
      "Write or explain a generic class and a generic method.",
    ],
    check: {
      question:
        'Does Device device = new Router("R1") turn the router object into a plain Device object?',
      answer:
        "No. The reference has the more general declared type, but the actual object remains a Router. Calls to overridable instance methods can dispatch to the Router implementation.",
    },
    scene: {
      scenario: "delivery",
      page: "Journey",
      instruction:
        "Compare a router and a computer in the device inspector. Ask which responsibilities are shared and which differ; then design a Java hierarchy on paper.",
    },
  },
  {
    id: 3,
    title: "Handling trouble & sharing work",
    question:
      "What should a program do when something goes wrong or jobs overlap?",
    idea: "A sensible program plans for failure and coordinates workers who share information. An exception is a controlled way to report a problem; threads are separate execution paths that need careful coordination.",
    topics: [
      t(
        "Exceptions and their hierarchy",
        "An exception is a structured problem report. Instead of silently producing nonsense, a method can hand the problem to code prepared to respond.",
        "Throwable includes Exception and Error. Many Exception subclasses are checked; RuntimeException and its subclasses are unchecked. Errors generally describe serious conditions applications should not casually swallow.",
        "A Java scenario reader could report malformed input instead of creating an invalid network.",
        "A dropped packet is not automatically a Java exception. Expected network loss can be ordinary simulation data.",
      ),
      t(
        "try, catch & finally",
        "Try a risky action, handle a particular problem if it occurs, and put necessary cleanup in the appropriate place.",
        "try encloses protected work; catch handles a matching exception type. finally is intended for completion/cleanup and normally runs when control exits the try/catch. Try-with-resources manages AutoCloseable resources.",
        "A Java import operation might catch an invalid-scenario exception and show the learner a useful message.",
        "finally is not guaranteed after every possible JVM termination. Avoid returning from finally because it can hide results or exceptions.",
      ),
      t(
        "throw versus throws",
        "throw sends a problem now; throws announces that a method may pass a problem to its caller.",
        "throw new IllegalArgumentException(...) creates and throws an exception. A throws clause declares possible exception types. Built-in examples include IOException and NumberFormatException.",
        "A Java setDelay(-1) method could reject a negative delay with an IllegalArgumentException.",
        "Writing throws does not itself throw an exception, and catching every exception without explanation hides defects.",
      ),
      t(
        "Your own exception type",
        "A named problem can make an error message easier to understand than a vague “something failed”.",
        "Extend Exception for a checked custom exception or RuntimeException for an unchecked one, choosing deliberately for the API. Supply useful context in its message.",
        "InvalidTopologyException could describe two cables incorrectly claiming the same port in a Java version.",
        "Custom exceptions are classes, not string labels. They should describe exceptional situations meaningful to the caller.",
      ),
      t(
        "Multitasking versus multithreading",
        "Different applications are like separate shops. Threads inside one application are like workers who share that shop’s tools and records.",
        "Processes have their own execution environments; threads in a process share memory. Concurrency allows progress on multiple tasks; it does not guarantee simultaneous execution or faster completion.",
        "Watching several parcels travel is a helpful image for concurrent activity. This simulator itself uses a deterministic event queue, not Java threads.",
        "Several moving packets on the screen do not prove that a program has several Java threads.",
      ),
      t(
        "Thread creation & life cycle",
        "A worker is created, starts working, may pause or wait, and eventually finishes.",
        "Create a Thread with a Runnable or subclass Thread. Call start() to schedule a new execution path. Java states are NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, and TERMINATED.",
        "A Java application might have a background task preparing a large trace while its interface stays responsive.",
        "Calling run() directly does not start a new thread. A terminated Thread object cannot be started again.",
      ),
      t(
        "Priorities, groups & daemon threads",
        "A priority is a request to the scheduler, a group is an organizational facility, and a daemon is a background worker that does not keep the application alive on its own.",
        "Platform threads support priorities and ThreadGroup. Mark a platform thread daemon before starting it. The JVM can exit when only daemon threads remain.",
        "A background housekeeping task is a better daemon analogy than a task responsible for saving the only copy of a message.",
        "Priority does not guarantee a particular execution order. Do not use daemon threads for essential work that must finish before exit.",
      ),
      t(
        "Synchronization & race conditions",
        "Two people updating the same notebook at once can overwrite each other. A shared lock makes an update happen as one protected action.",
        "synchronized uses an object’s monitor. Threads holding the same monitor mutually exclude one another and establish relevant visibility guarantees. Compound updates such as count++ are not automatically atomic.",
        "Two Java workers updating one delivery counter should coordinate around the same shared state.",
        "Synchronizing unrelated locks does not protect the same counter. More locking can also introduce deadlocks if lock ordering is careless.",
      ),
      t(
        "Inter-thread communication",
        "Sometimes a worker should wait until there is something useful to do, rather than repeatedly checking an empty tray.",
        "wait(), notify(), and notifyAll() operate with an object monitor. Call them while owning that monitor; test waiting conditions in a loop. wait() releases that monitor while waiting, while Thread.sleep() does not release held monitors.",
        "A Java producer can place a parcel in a queue; a consumer waits until the queue is nonempty.",
        "A notification is not the parcel itself and is not a guarantee that a condition remains true. Recheck the condition after waking.",
      ),
    ],
    example: {
      title: "Report a problem, then protect one shared counter",
      file: "UnitThreeDemo.java",
      code: `public class UnitThreeDemo {
    static class Counter {
        private int count;
        synchronized void record() { count++; }
        synchronized int value() { return count; }
    }
    public static void main(String[] args) throws InterruptedException {
        try {
            int delay = -1;
            if (delay < 0) throw new IllegalArgumentException("Negative delay");
        } catch (IllegalArgumentException problem) {
            System.out.println(problem.getMessage());
        }
        Counter counter = new Counter();
        Runnable work = () -> {
            for (int i = 0; i < 3; i++) counter.record();
        };
        Thread first = new Thread(work);
        Thread second = new Thread(work);
        first.start(); second.start();
        first.join(); second.join();
        System.out.println(counter.value());
    }
}`,
      output: "Negative delay\n6",
      walk: [
        "The negative delay is rejected and the matching catch explains the problem.",
        "Both threads share one Counter object and therefore the same monitor.",
        "Each worker records three times, with synchronized protecting each increment.",
        "join() waits for both workers before reading the final count. It does not choose which worker runs first.",
      ],
    },
    revision: [
      "Explain checked versus unchecked exceptions and the Throwable hierarchy.",
      "Differentiate throw from throws, and explain try/catch/finally.",
      "Draw and explain thread states; compare start() and run().",
      "Explain a race condition, synchronization, wait/notify, priorities, groups, and daemon behavior.",
    ],
    check: {
      question:
        "Two workers each execute count++ three times. Is the answer always six without synchronization?",
      answer:
        "No. The read-modify-write steps can overlap and lose updates. The example protects each update using the same Counter monitor, then waits with join() before reading the result.",
    },
    scene: {
      scenario: "loss",
      page: "Why This Happened",
      instruction:
        "Observe loss recovery, then distinguish an expected network event from a Java programming exception. The retry scheduler is not a Java thread.",
    },
  },
  {
    id: 4,
    title: "Organizing data & responding to events",
    question:
      "Where should information live, and how does a program react to a click?",
    idea: "You need different kinds of notebook: an ordered list, a collection with no duplicates, or a lookup by name. An interactive application also needs a clear way to connect an action to a response.",
    topics: [
      t(
        "String and Object, revisited",
        "Two different slips can contain the same written words. Same object and same contents are different questions.",
        "For references, == tests identity; equals() can test logical equality. String overrides equals() for text contents. Object also provides toString() and hashCode(); equal objects must have equal hash codes.",
        "Two message objects can contain the same text while having different identities. A packet ID is also different from its payload.",
        "Use equals() for String content comparison. Do not assume that matching hash codes prove that two objects are equal.",
      ),
      t(
        "Collections Framework: choosing a container",
        "Choose storage according to the question you need to answer: “what came next?”, “have I already seen this?”, or “what belongs to this key?”",
        "java.util supplies collection interfaces and implementations. Collection is the root interface for many containers; Map is a separate key/value hierarchy in the collections framework.",
        "The event timeline, seen-packet IDs, and ARP lookup suggest three different data-structure needs.",
        "List, Set, and Map are not interchangeable names for the same behavior.",
      ),
      t(
        "List: order and duplicates",
        "A List is like a numbered attendance sheet. Position matters and the same value may appear again.",
        "List supports ordered elements and indexed access. ArrayList is a common implementation. Unlike an array, a list can change size.",
        "A Java event log could be List<String> or List<TraceEvent>. Retransmission events may intentionally repeat similar information.",
        "Repeated entries are not necessarily a bug in a List. Choose Set when uniqueness is the requirement.",
      ),
      t(
        "Set: uniqueness",
        "A Set is like a guest list that should contain each person only once.",
        "Set excludes duplicate elements according to its implementation’s equality rules. HashSet does not promise iteration order.",
        "A Java reassembly helper could track already-delivered identifiers with a Set, provided its notion of identity is correct.",
        "Deduplicating by message text would be wrong if two different legitimate packets contain identical text.",
      ),
      t(
        "Map: key to value",
        "A Map is a small dictionary: look up an address and receive the corresponding answer.",
        "Map associates keys with values. A key has at most one current mapped value; put() with an existing key replaces its value. HashMap does not guarantee iteration order.",
        "ARP’s next-hop IP → MAC relationship and a switch’s MAC → port relationship are useful lookup analogies.",
        "A Java Map is a data structure; it does not perform ARP or routing by itself.",
      ),
      t(
        "I/O: java.io and resource care",
        "Input brings information into a program. Output sends it somewhere else. Files are one possible destination or source.",
        "InputStream/OutputStream handle bytes; Reader/Writer handle characters. Buffered variants reduce small operations. Choose text encodings deliberately and close resources, commonly with try-with-resources.",
        "Exporting a trace and loading a scenario are I/O ideas. The current app uses browser file APIs, not java.io.",
        "Reading a file does not execute its contents. Import still needs validation, and closing a resource is different from collecting object memory.",
      ),
      t(
        "Event, source & listener: delegation",
        "A doorbell button creates an event. A registered listener is the person told to respond.",
        "An event source creates an event object and notifies registered listeners. Java GUI code uses listener interfaces and registration methods; this is the delegation event model.",
        "Clicking Send is the source/action analogy; the handler starts a simulation. In a Java Swing version, a JButton could notify an ActionListener.",
        "The listener is not continuously polling the button. It must be registered with the appropriate source.",
      ),
      t(
        "Mouse, keyboard & adapter classes",
        "A mouse click and a key press are different kinds of input, and each needs the right handler.",
        "MouseListener and KeyListener expose callback methods. Adapter classes such as MouseAdapter provide empty implementations so you can override only callbacks you need. Keyboard events also depend on focus.",
        "Inspecting a device with the mouse or selecting its button with the keyboard are two ways to reach the same information.",
        "An adapter class is not a layout manager. Registering a key listener on a component without usable focus can leave it unresponsive.",
      ),
      t(
        "Five layout managers",
        "A layout manager is a seating plan for controls. It rearranges them according to rules rather than leaving every control at a fixed pixel position.",
        "FlowLayout arranges a flow of components; BorderLayout has five regions; GridLayout uses equal cells; CardLayout shows one card at a time; GridBagLayout supports flexible grid constraints.",
        "The message controls, large scene, side notebook, and bottom playback suggest regions. A hypothetical Swing version might use BorderLayout and nested layouts.",
        "This site uses CSS layout. A similar arrangement does not mean it is running Java BorderLayout.",
      ),
    ],
    example: {
      title: "Three questions, three kinds of container",
      file: "UnitFourDemo.java",
      code: `import java.util.*;
public class UnitFourDemo {
    public static void main(String[] args) {
        List<String> events = new ArrayList<>();
        events.add("send"); events.add("send");
        Set<String> deliveredIds = new HashSet<>();
        deliveredIds.add("P1"); deliveredIds.add("P1");
        Map<String, String> arp = new HashMap<>();
        arp.put("192.168.1.1", "02:00:00:00:00:01");
        System.out.println(events.size());
        System.out.println(deliveredIds.size());
        System.out.println(arp.get("192.168.1.1"));
    }
}`,
      output: "2\n1\n02:00:00:00:00:01",
      walk: [
        "The List keeps both send entries because order and repetition are allowed.",
        "The Set keeps one occurrence of the same ID.",
        "The Map answers an address lookup without requiring an index position.",
        "The example looks up a known key and does not rely on HashMap iteration order.",
      ],
    },
    revision: [
      "Compare String identity and content; relate equals() to hashCode().",
      "Compare List, Set, and Map using suitable examples.",
      "Distinguish byte streams, character streams, and resource cleanup.",
      "Explain delegation, event sources/listeners, adapters, and all five layout types.",
    ],
    check: {
      question:
        "Which is more suitable for looking up a MAC by its IP: List, Set, or Map?",
      answer:
        "A Map expresses the relationship directly: the IP is a key and the MAC is its value. A List is useful for ordered events; a Set is useful for uniqueness.",
    },
    scene: {
      scenario: "delivery",
      page: "ARP Cache",
      instruction:
        "Compare the ordered event timeline with ARP’s key/value lookup. Then inspect MAC Tables and explain which Java container fits each responsibility.",
    },
  },
  {
    id: 5,
    title: "Desktop interfaces & database connections",
    question: "How do I give a Java program controls and persistent storage?",
    idea: "The interface is the front desk where people interact with the application. A database is a separate organized store. Swing builds Java desktop controls; JDBC lets Java code communicate with a database through a suitable driver.",
    topics: [
      t(
        "Swing, AWT & components",
        "A window is a container that holds visible controls such as text, buttons, and lists.",
        "Swing builds on AWT and supplies a richer, mostly lightweight component toolkit with pluggable look and feel. JFrame is a top-level window; JComponent is the base for many Swing components.",
        "A desktop Java recreation could put a network drawing and controls inside a JFrame.",
        "Swing is a Java desktop toolkit, not a way to turn the existing HTML page into a Java program. Some top-level windows still use native resources.",
      ),
      t(
        "MVC architecture",
        "Keep the information, the way it is displayed, and the code that reacts to actions conceptually separate.",
        "Model represents application data; view presents it; controller handles interaction and coordinates changes. Swing uses separable component models, which are not a strict one-to-one textbook MVC implementation for every component.",
        "The simulated state, canvas rendering, and button handlers make these responsibilities easy to discuss here.",
        "Renaming files Model, View, and Controller does not automatically separate responsibilities correctly.",
      ),
      t(
        "Labels, icons, text & buttons",
        "Some controls show information; others let a person enter information or request an action.",
        "JLabel displays text or an icon, ImageIcon loads icon content, JTextField accepts a line of text, and JButton triggers an action through a listener.",
        "Message input, the Send button, and status text are direct functional analogies for these Swing controls.",
        "Creating a JButton is not enough: it needs a listener, a container, and a displayed window.",
      ),
      t(
        "Choices: checks, radios, lists & combos",
        "Use the kind of choice that matches the question. A checkbox is a yes/no choice; a grouped radio choice allows one selection.",
        "JCheckBox, JRadioButton with ButtonGroup, JList, and JComboBox cover different selection patterns. A ButtonGroup coordinates exclusivity; it is not a visible layout container.",
        "Reduced motion is a checkbox idea; TCP/UDP is a mutually exclusive choice; scenarios resemble a combo box.",
        "Two separate JRadioButton objects are not automatically mutually exclusive without grouping.",
      ),
      t(
        "Trees, tables & menus",
        "Trees show parent/child relationships, tables show rows and columns, and menus group commands.",
        "JTree and JTable organize hierarchical and tabular views. Menus use JMenuBar, JMenu, JMenuItem, JCheckBoxMenuItem, JRadioButtonMenuItem, and JSeparator; JPopupMenu provides a context menu.",
        "Routing and ARP tables are tabular; a Java type hierarchy could be shown as a tree; export/settings commands could live in a menu.",
        "A JTable displays data through a model; a database table is a different object. Similar names do not make them the same thing.",
      ),
      t(
        "Responsive Swing and event handling",
        "The front desk should stay available while slower work happens elsewhere.",
        "Create/update Swing UI on the event dispatch thread, commonly using SwingUtilities.invokeLater(). Keep long operations off that thread and hand UI updates back safely.",
        "A desktop version should not freeze its Send button while a slow database operation runs.",
        "Ordinary background Java threads should not directly modify Swing widgets. Database work on the event thread can freeze the window.",
      ),
      t(
        "JDBC architecture & driver types",
        "JDBC is a standard conversation between Java code and a database. A driver translates that conversation for the chosen database system.",
        "The traditional categories are Type 1 bridge, Type 2 native API, Type 3 middleware, and Type 4 direct Java database-protocol driver. A Connection represents a database session; DriverManager or a DataSource can provide connections.",
        "A Java version might store completed experiment results in a real database through its JDBC driver.",
        "This app uses browser local storage and JSON files; it has no JDBC connection. Driver availability and database setup are separate requirements.",
      ),
      t(
        "JDBC steps, classes & interfaces",
        "First connect, then send a statement, inspect the result, and clean up.",
        "Typical steps are: make a driver available; obtain a Connection; create Statement or PreparedStatement; execute SQL; consume a ResultSet for queries; handle SQLException; close resources. Modern suitable drivers can register automatically.",
        "An experiment history could be inserted using a PreparedStatement, and later selected into a results table.",
        "For values supplied by users, use parameters rather than concatenating them into SQL. A placeholder binds a value, not an arbitrary table name.",
      ),
      t(
        "Creating databases and tables",
        "A database is the larger store; a table is one named arrangement of rows and columns inside it.",
        "After connecting to a database system, JDBC can execute supported SQL such as CREATE TABLE. Creating a database, choosing its name, obtaining permission, and database-selection syntax depend on the database product.",
        "A hypothetical Java project could create an experiment table and store message, protocol, and outcome as columns.",
        "There is no single universal JDBC command that creates a new database on every DBMS. JDBC also does not remove the need for a running database and an appropriate driver.",
      ),
    ],
    example: {
      title: "A small Java desktop front desk",
      file: "UnitFiveDemo.java",
      code: `import javax.swing.*;
import java.awt.*;
public class UnitFiveDemo {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame window = new JFrame("Message desk");
            JTextField message = new JTextField("Hello");
            JButton send = new JButton("Send");
            JLabel status = new JLabel("Waiting");
            send.addActionListener(event ->
                status.setText("You entered: " + message.getText()));
            window.add(message, BorderLayout.NORTH);
            window.add(send, BorderLayout.CENTER);
            window.add(status, BorderLayout.SOUTH);
            window.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            window.setSize(340, 160);
            window.setVisible(true);
        });
    }
}`,
      output:
        "A desktop window opens. Enter a message and click Send.\nThe label becomes: You entered: <your text>",
      walk: [
        "invokeLater schedules construction on Swing’s event dispatch thread.",
        "JFrame contains the text field, button, and label in BorderLayout regions.",
        "The registered ActionListener reads the text and updates the label.",
        "This teaching example does not send network traffic or connect to a database. JDBC is a separate concern.",
      ],
    },
    revision: [
      "Explain Swing versus AWT and the roles of containers and components.",
      "Map each selection control to a suitable question.",
      "Explain MVC responsibilities, menu types, trees, tables, and event-thread care.",
      "Describe JDBC architecture, four driver categories, the connection/query lifecycle, and database-specific DDL.",
    ],
    check: {
      question:
        "If this web app remembers your lesson progress, does that mean it uses JDBC?",
      answer:
        "No. This application stores preferences in browser local storage. JDBC is a Java API that requires a suitable driver and database connection. The persistence idea is related, but the implementation is different.",
    },
    scene: {
      scenario: "delivery",
      page: "Metrics",
      instruction:
        "Identify the message input, Send button, protocol choices, table views, and settings. Map their roles to Swing controls, then discuss what a separate JDBC-backed history feature would require.",
    },
  },
];
export const jdbcExample = {
  title: "JDBC table and parameterized insert",
  code: `// Requires an existing, open JDBC Connection named db.
// The database and its JDBC driver must already be configured.
try (java.sql.Statement schema = db.createStatement()) {
    schema.executeUpdate("CREATE TABLE experiment (message VARCHAR(512))");
}
try (java.sql.PreparedStatement insert = db.prepareStatement(
        "INSERT INTO experiment (message) VALUES (?)")) {
    insert.setString(1, "Hello");
    insert.executeUpdate();
}`,
  note: "This fragment assumes an open Connection and a fresh schema. A second CREATE TABLE may fail if the table already exists. It illustrates a table in an existing database; creating the database itself depends on the chosen DBMS and permissions.",
};

export function javaStudyNotes(): string {
  const header = `# Java, in everyday language\n\n${javaSyllabus.institution} · ${javaSyllabus.regulation} · ${javaSyllabus.branch} · ${javaSyllabus.semester}\n\n${javaSyllabus.code} — ${javaSyllabus.course}\n\nTheory only. Aligned to printed pages 5–6 of the [official syllabus](${javaSyllabus.source}). Checked ${javaSyllabus.checked}. Independent explanations, not official college notes.\n\nPacketVerse’s network world supplies analogies; the app itself is TypeScript, not Java. Java examples are separate programs. They do not execute inside the web page. The laboratory course and experiment list are excluded.\n\n`;
  return (
    header +
    javaUnits
      .map(
        (u) =>
          `## Unit ${u.id}: ${u.title}\n\n**${u.question}**\n\n${u.idea}\n\n${u.topics.map((t) => `### ${t.title}\n\n**In everyday words:** ${t.plain}\n\n**In Java terms:** ${t.java}\n\n**PacketVerse connection:** ${t.connection}\n\n**Common mix-up:** ${t.watch}\n\n`).join("")}### Example: ${u.example.title}\n\nSave as ${u.example.file}.\n\n\`\`\`java\n${u.example.code}\n\`\`\`\n\nExpected ${u.id === 5 ? "interaction" : "output"}:\n\n\`\`\`text\n${u.example.output}\n\`\`\`\n\n${u.example.walk.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n### Revision prompts\n\n${u.revision.map((s) => `- ${s}`).join("\n")}\n\n### Check your understanding\n\n${u.check.question}\n\n${u.check.answer}\n\n### Explore the analogy\n\n${u.scene.instruction}\n\n`,
      )
      .join("\n") +
    `## JDBC fragment\n\n\`\`\`java\n${jdbcExample.code}\n\`\`\`\n\n${jdbcExample.note}\n\n## Java references\n\n- [Java classes and objects](https://dev.java/learn/classes-objects/)\n- [Java Thread API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html)\n- [Oracle Swing tutorial](https://docs.oracle.com/javase/tutorial/uiswing/)\n- [Oracle JDBC tutorial](https://docs.oracle.com/javase/tutorial/jdbc/basics/)\n\nThe older Oracle tutorial trails target JDK 8; the examples here avoid applets and obsolete thread-control APIs.\n`
  );
}

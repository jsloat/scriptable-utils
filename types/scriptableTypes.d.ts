declare const Safari: {
  openInApp: (url: string, fullscreen?: boolean) => Promise<void>;
  open: (url: string) => void;
};

//

type RequestResponse = {
  statusCode: number;
  url: string;
  headers: {
    'Content-Type': string;
    [key: string]: any;
  };
  mimeType: string;
  textEncodingName: string;
};

declare class Request {
  constructor(url: string);
  url: string;
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'HEAD'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  onRedirect?: (r: Request) => Request;
  allowInsecureRequest?: boolean;
  readonly response?: RequestResponse;
  readonly loadString: () => Promise<string>;
  readonly loadJSON: () => Promise<any>;
  readonly load: () => Promise<any>;
  readonly loadImage: () => Promise<Image>;
}

declare class WebView {
  constructor();
  shouldAllowRequest: (request: Request) => boolean;
  loadURL: (url: string) => Promise<void>;
  loadHTML: (html: string) => Promise<void>;
  evaluateJavaScript: <R = any>(
    javascript: string,
    useCallback?: boolean
  ) => Promise<R>;
  present: (fullscreen?: boolean) => Promise<void>;
}

declare class CallbackURL {
  constructor(baseUrl: string);
  addParameter: (name: string, value: string) => void;
  open: <T = any>() => Promise<T>;
  getURL: () => string;
}

//

declare const ShareSheet: {
  present: (activityItems: any[]) => Promise<AnyObj>;
};

//

declare class Size {
  constructor(width: number, height: number);
  width: number;
  height: number;
}

//

declare class Notification {
  constructor();
  /** To reschedule a notification, use the identifier */
  identifier: string;
  title: string;
  subtitle: string;
  body: string;
  /**
   * By default Scriptable attempts to determine an appropriate height for your
   * notification. If you want to override the default behavior, you can specify
   * a preferred content height. The preferred content height is only used when
   * running a script inside the notification, i.e. when scriptName is not null.
   * iOS may limit the height of the notification in which case the preferred
   * content height is not guaranteed to be respected.
   */
  preferredContentHeight: number;
  /**
   * Number to display in the app icon's badge. When the number is zero, no
   * badge is displayed. When the number is greater than zero, the number is
   * displayed in the app icon's badge. Setting the value to null, will leave
   * the badge unchanged. The default value is null.
   */
  badge?: number;
  /** Identifier for grouping the notification. */
  threadIdentifier: string;
  /**
   * Custom information, can be accessed from the `Notification.opened` property
   * when run from a notification
   */
  userInfo?: AnyObj;
  sound:
    | null
    | 'default'
    | 'accept'
    | 'alert'
    | 'complete'
    | 'event'
    | 'failure'
    | 'piano_error'
    | 'piano_success'
    | 'popup';
  /**
   * URL to open when notification is tapped. The Scriptable application will
   * open the URL when the notification is tapped. This can be a URL that uses
   * Scriptables URL scheme, the URL scheme of another application or a website
   * URL.
   */
  openURL: string;
  /**
   * Name of script to run in rich notification. When notification is force
   * touched or long pressed, Scriptable can run a script inside the
   * notification without opening the app. Set the scriptName to a name of an
   * existing script to run it inside the notification.
   */
  scriptName: string;
  /**
   * If the notification has already been delivered, for example because it was
   * fetched using Notification.allDelivered(), the deliveryDate will be
   * populated. Otherwise it will be null.
   */
  readonly deliveryDate: Date;
  readonly nextTriggerDate: Date;
  readonly actions: { [title: string]: string };
  /**
   * If an existing notification is modified, it must be scheduled again for the
   * changes to take effect.
   */
  schedule: () => Promise<void>;
  remove: () => Promise<void>;
  /** NB: don't pass `new Date()`, as the time will have passed by the time it's scheduled */
  setTriggerDate: (date: Date) => void;
  setDailyTrigger: (hour: number, minute: number, repeats: boolean) => void;
  setWeeklyTrigger: (
    weekday: number,
    hour: number,
    minute: number,
    repeats: boolean
  ) => void;
  addAction: (title: string, url: string, destructive?: boolean) => void;
  static allPending: () => Promise<Notification[]>;
  static allDelivered: () => Promise<Notification[]>;
  static removeAllPending: () => Promise<void>;
  static removeAllDelivered: () => Promise<void>;
  static removePending: (notificationIds: string[]) => Promise<void>;
  static removeDelivered: (notificationIds: string[]) => Promise<void>;
  static resetCurrent: () => void;
}

//

declare const Device: {
  name: () => string;
  systemName: () => string;
  systemVersion: () => string;
  model: () => string;
  isPhone: () => boolean;
  isPad: () => boolean;
  screenBrightness: () => number; // 0-1
  batteryLevel: () => number;
  isDischarging: () => boolean;
  isCharging: () => boolean;
  isFullyCharged: () => boolean;
  isUsingDarkAppearance: () => boolean;
  volume: () => number;
  setScreenBrightness: (percentage: number) => void; // 0-1
  screenSize: () => Size;
  isInPortrait: () => boolean;
};

declare const args: {
  /** Plain texts supplied by a share sheet or a shortcut action. */
  readonly plainTexts: string[];
  /** URLs supplied by a share sheet or a shortcut action. */
  readonly urls: string[];
  /** File URLs supplied by a share sheet or a shortcut action. */
  readonly fileURLs: string[];
  /** Query parameters from a URL scheme. */
  readonly queryParameters: Record<string, string>;
  /** This parameter can be any text, list, dictionary or file and will be
   * exposed in your script using the appropriate type. When passing a file, the
   * "Run Script" action will attempt to read the file as JSON or a plain text.
   * If the file cannot be read as JSON or a plain text, a path to the file will
   * be passed as the input parameter.
   *
   * This is the primary param you can specify in Shortcuts */
  readonly shortcutParameter: any;
  readonly notification?: Notification;
  /**
   * When creating a widget on the Home screen, you can define a parameter that can be read in your script using args.widgetParameter.
   * The parameter can be used to differentiate the behavior of multiple widgets.
   */
  readonly widgetParameter?: string;
};

declare const config: {
  /** Whether the script is running in the app. */
  readonly runsInApp: boolean;
  /** Whether running in the action extension */
  readonly runsInActionExtension: boolean;
  /** Whether running in Siri */
  readonly runsWithSiri: boolean;
  /** Whether running in a widget */
  readonly runsInWidget: boolean;
  /** Whether running in a notification */
  readonly runsInNotification: boolean;
  /** Whether the script was run from the home screen. You can add a script to the home screen from the script settings. */
  readonly runsFromHomeScreen: boolean;
  /**
   * The size of the widget the script is running in.
   * Value is null when the script is not running in a widget.
   */
  readonly widgetFamily: 'small' | 'medium' | 'large' | null;
};

declare class Script {
  static name: () => string;
  static complete: () => void;
  static setShortcutOutput: (value: any) => void;
  static setWidget: (widget: ListWidget) => void;
}

declare type ID =
  `${Uppercase<string>}-${Uppercase<string>}-${Uppercase<string>}-${Uppercase<string>}-${Uppercase<string>}`;

declare const UUID: {
  string: () => ID;
};

declare const Keychain: {
  contains: (key: string) => boolean;
  set: (key: string, value: string) => void;
  get: (key: string) => string;
  remove: (key: string) => void;
};

//

declare class Color {
  constructor(hex: string, alpha?: number);
  hex: string;
  red: number;
  green: number;
  blue: number;
  alpha: number;
  static black: () => Color;
  static red: () => Color;
  static yellow: () => Color;
  static blue: () => Color;
  static green: () => Color;
  static white: () => Color;
  static magenta: () => Color;
  static clear: () => Color; // Transparent
  static dynamic: (lightColor: Color, darkColor: Color) => Color;
}

//

type CalendarAvailability = 'busy' | 'free' | 'tentative' | 'unavailable';

declare class Calendar {
  static forReminders: () => Promise<Calendar[]>;
  static forEvents: () => Promise<Calendar[]>;
  static forRemindersByTitle: (title: string) => Promise<Calendar>;
  static forEventsByTitle: (title: string) => Promise<Calendar>;
  static createForReminders: (title: string) => Promise<Calendar>;
  static findOrCreateForReminders: (title: string) => Promise<Calendar>;
  static defaultForReminders: () => Promise<Calendar>;
  static defaultForEvents: () => Promise<Calendar>;
  static presentPicker: (allowMultiple: boolean) => Promise<Calendar>;
  readonly identifier: string;
  title: string;
  readonly isSubscribed: boolean;
  readonly allowsContentModifications: boolean;
  color: Color;
  supportsAvailability: (a: CalendarAvailability) => boolean;
  save: () => void;
  remove: () => void;
}

declare type CalendarEventAttendee = {
  isCurrentUser: boolean;
  url: string;
  name: string;
  status: 'accepted' | 'pending';
};

declare class CalendarEvent {
  static presentCreate: () => Promise<CalendarEvent>;
  static today: (calendars: Calendar[]) => Promise<CalendarEvent[]>;
  static tomorrow: (calendars: Calendar[]) => Promise<CalendarEvent[]>;
  static yesterday: (calendars: Calendar[]) => Promise<CalendarEvent[]>;
  static thisWeek: (calendars: Calendar[]) => Promise<CalendarEvent[]>;
  static nextWeek: (calendars: Calendar[]) => Promise<CalendarEvent[]>;
  static lastWeek: (calendars: Calendar[]) => Promise<CalendarEvent[]>;
  static between: (
    startDate: Date,
    endDate: Date,
    calendars: Calendar[]
  ) => Promise<CalendarEvent[]>;
  readonly identifier: string;
  title: string;
  location: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  readonly attendees?: CalendarEventAttendee[];
  availability: CalendarAvailability;
  timeZone: string;
  calendar: Calendar;
  readonly save: () => void;
  readonly remove: () => void;
  readonly presentEdit: () => Promise<CalendarEvent>;
}

//

declare class Mail {
  constructor();
  toRecipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
  subject: string;
  body: string;
  isBodyHTML: boolean;
  preferredSendingEmailAddress: string;
  send: () => Promise<void>;
}

//

declare class UITableCell {
  static text: (title?: string, subtitle?: string) => UITableCell;
  static button: (title: string) => UITableCell;
  static image: (image: Image) => UITableCell;
  widthWeight: number;
  onTap: () => any;
  dismissOnTap: boolean;
  titleColor: Color;
  subtitleColor: Color;
  leftAligned: () => void;
  centerAligned: () => void;
  rightAligned: () => void;
  titleFont: Font;
  subtitleFont: Font;
}

declare class UITableRow {
  constructor();
  cellSpacing: number;
  height: number;
  isHeader: boolean;
  dismissOnSelect: boolean;
  onSelect: (n: number) => MaybePromise<void>;
  backgroundColor: Color;
  addCell: (cell: UITableCell) => UITableCell;
  addText: (title: string, subtitle: string) => UITableCell;
  addButton: (title: string) => UITableCell;
}

declare class UITable {
  constructor();
  showSeparators: boolean;
  addRow: (row: UITableRow) => void;
  removeRow: (row: UITableRow) => void;
  removeAllRows: () => void;
  reload: () => void;
  present: (fullscreen?: boolean) => Promise<void>;
}

//

declare class RecurrenceRule {}

type TaskCalFetch = (calendars?: Calendar[]) => Promise<Reminder[]>;

declare class Reminder {
  constructor();
  static scheduled: TaskCalFetch;
  static all: TaskCalFetch;
  static allCompleted: TaskCalFetch;
  static allIncomplete: TaskCalFetch;
  static allDueToday: TaskCalFetch;
  static completedDueToday: TaskCalFetch;
  static incompleteDueToday: TaskCalFetch;
  static allDueTomorrow: TaskCalFetch;
  static completedDueTomorrow: TaskCalFetch;
  static incompleteDueTomorrow: TaskCalFetch;
  static allDueYesterday: TaskCalFetch;
  static completedDueYesterday: TaskCalFetch;
  static incompleteDueYesterday: TaskCalFetch;
  static allDueThisWeek: TaskCalFetch;
  static completedDueThisWeek: TaskCalFetch;
  static incompleteDueThisWeek: TaskCalFetch;
  static allDueNextWeek: TaskCalFetch;
  static completedDueNextWeek: TaskCalFetch;
  static incompleteDueNextWeek: TaskCalFetch;
  static allDueLastWeek: TaskCalFetch;
  static completedDueLastWeek: TaskCalFetch;
  static incompleteDueLastWeek: TaskCalFetch;
  /** Week in these methods is M-Sun */
  static completedThisWeek: TaskCalFetch;
  static completedLastWeek: TaskCalFetch;
  static allDueBetween: (
    startDate: Date,
    endDate: Date,
    calendars?: Calendar[]
  ) => Promise<Reminder[]>;
  static completedDueBetween: (
    startDate: Date,
    endDate: Date,
    calendars?: Calendar[]
  ) => Promise<Reminder[]>;
  static incompleteDueBetween: (
    startDate: Date,
    endDate: Date,
    calendars?: Calendar[]
  ) => Promise<Reminder[]>;
  static completedBetween: (
    startDate: Date,
    endDate: Date,
    calendars?: Calendar[]
  ) => Promise<Reminder[]>;
  readonly identifier: ID;
  readonly completionDate?: Date;
  readonly creationDate: Date;
  title: string;
  notes?: string;
  isCompleted: boolean;
  priority: number;
  dueDate?: Date;
  dueDateIncludesTime: boolean;
  calendar: Calendar;
  readonly save: () => void;
  readonly remove: () => void;
  readonly addRecurrenceRule: (rule: RecurrenceRule) => void;
  readonly removeAllRecurrenceRules: () => void;
}

//

declare class FileManager {
  static local: () => FileManager;
  static iCloud: () => FileManager;
  readString: (filePath: string) => string;
  writeString: (filePath: string, content: string) => void;
  readImage: (filePath: string) => Image | null;
  writeImage: (filePath: string, image: Image) => void;
  remove: (filePath: string) => void;
  move: (sourceFilePath: string, destinationFilePath: string) => void;
  copy: (sourceFilePath: string, destinationFilePath: string) => void;
  fileExists: (filePath: string) => boolean;
  bookmarkedPath: (name: string) => string;
  bookmarkExists: (name: string) => boolean;
  downloadFileFromiCloud: (filePath: string) => Promise<void>;
  isFileDownloaded: (filePath: string) => boolean;
  listContents: (directoryPath: string) => string[];
  documentsDirectory: () => string;
  isDirectory: (path: string) => boolean;
  /** intermediateDirectories: whether to create all intermediate directories.
   * Defaults to false. */
  createDirectory: (path: string, intermediateDirectories?: boolean) => void;
  creationDate: (path: string) => Date | null;
  modificationDate: (path: string) => Date | null;
  /** Takes a file path and returns the name of the file. Also supports getting
   * the name of a directory. The returned file name optionally includes the
   * extension of the file. includeFileExtension defaults to false. */
  fileName: (path: string, includeFileExtension?: boolean) => string;
  /** The source can either be host for file bookmarks that can be used in the
   * app or siri_shortcuts for file bookmarks that can be used in Siri and
   * Shortcuts. */
  allFileBookmarks: () => { name: string; source: 'host' | 'siri_shortcuts' }[];
  /** Returns empty string for directories */
  fileExtension: (path: string) => string;
  fileSize: (path: string) => number;
}

//

/**
 * Text field in an alert.
 *
 * Use the text field to customize of the text entered into it.
 *
 * You do not create instances of this.  Instead you add a text field to an
 * Alert using the addTextField and addSecureTextField on the alert.
 */
declare class TextField {
  font: Font;
  /** Hides the text that is entered when set to true */
  isSecure: boolean;
  placeholder: string;
  /** Text in the text field */
  text: string;
  textColor: Color;
  centerAlignText: () => void;
  leftAlignText: () => void;
  rightAlignText: () => void;
  /** Numeric w/ decimal point */
  setDecimalPadKeyboard: () => void;
  setDefaultKeyboard: () => void;
  setEmailAddressKeyboard: () => void;
  /** 0-9 */
  setNumberPadKeyboard: () => void;
  setNumbersAndPunctuationKeyboard: () => void;
  /** 0-9, *, # */
  setPhonePadKeyboard: () => void;
  /** @ and # */
  setTwitterKeyboard: () => void;
  /** period, slash, ".com" */
  setURLKeyboard: () => void;
  /** space and period featured */
  setWebSearchKeyboard: () => void;
}

declare class Alert {
  constructor();
  title: string;
  message: string;
  addAction: (title: string) => void;
  addDestructiveAction: (title: string) => void;
  addCancelAction: (title: string) => void;
  addTextField: (placeholder: string, text: string) => TextField;
  addSecureTextField: (placeholder: string, text: string) => TextField;
  textFieldValue: (index: number) => string;
  present: () => Promise<number>;
  presentAlert: () => Promise<number>;
  presentSheet: () => Promise<number>;
}

declare class DatePicker {
  constructor();
  minimumDate: Date;
  maximumDate: Date;
  countdownDuration: number;
  minuteInterval: number;
  initialDate: Date;
  pickTime: () => Promise<Date>;
  pickDate: () => Promise<Date>;
  pickDateAndTime: () => Promise<Date>;
  pickCountdownDuration: () => Promise<number>;
}

//

declare class XMLParser {
  constructor(string: string);
  string: string;
  didStartDocument?: () => any;
  didEndDocument?: () => any;
  didStartElement?: (
    elementName: string,
    attributes: Record<string, string>
  ) => any;
  didEndElement?: (elementName: string) => any;
  foundCharacters?: (characters: string) => any;
  parseErrorOccurred?: (error: string) => any;
  readonly parse: () => boolean;
}

//

// Can't get typing for console without including DOM as tsconfig lib, but doing that
// includes a type definition for Notification which collides here. This way at least
// we get the custom definitions of log (only accepts one arg)
declare const console: {
  log: (message: any) => void;
  warn: (message: any) => void;
  error: (message: any) => void;
};

//

declare const btoa: (str: string) => string;

//

type DataGetter<T> = (param: T) => Data;

declare class Data {
  static fromString: DataGetter<string>;
  static fromFile: DataGetter<string>;
  static fromBase64String: DataGetter<string>;
  static fromJPEG: DataGetter<Image>;
  static fromPNG: DataGetter<Image>;
  toRawString: () => string;
  toBase64String: () => string;
  getBytes: () => number[];
}

declare class Image {
  size: Size;
  static fromFile: (filePath: string) => Image | null;
  static fromData: (data: Data) => Image;
}

//
// Widgets!!
//

/** A linear gradient to be used in a widget. */
declare class LinearGradient {
  constructor();
  colors: Color[];
  /** Each location should be a value in the range of 0 to 1 and indicates the location of each color in the gradients colors array. */
  locations: number[];
}

declare class Font {
  /** Refer to iosfonts.com for a list of the fonts that are available in iOS and iPadOS */
  constructor(name: string, size: number);
  static largeTitle: () => Font;
  static title1: () => Font;
  static title2: () => Font;
  static title3: () => Font;
  static headline: () => Font;
  static subheadline: () => Font;
  static body: () => Font;
  static callout: () => Font;
  static footnote: () => Font;
  static caption1: () => Font;
  static caption2: () => Font;
  static systemFont: (size: number) => Font;
  static ultraLightSystemFont: (size: number) => Font;
  static thinSystemFont: (size: number) => Font;
  static lightSystemFont: (size: number) => Font;
  static regularSystemFont: (size: number) => Font;
  static mediumSystemFont: (size: number) => Font;
  static semiboldSystemFont: (size: number) => Font;
  static boldSystemFont: (size: number) => Font;
  static heavySystemFont: (size: number) => Font;
  static blackSystemFont: (size: number) => Font;
  static italicSystemFont: (size: number) => Font;
  static ultraLightMonospacedSystemFont: (size: number) => Font;
  static thinMonospacedSystemFont: (size: number) => Font;
  static lightMonospacedSystemFont: (size: number) => Font;
  static regularMonospacedSystemFont: (size: number) => Font;
  static mediumMonospacedSystemFont: (size: number) => Font;
  static semiboldMonospacedSystemFont: (size: number) => Font;
  static boldMonospacedSystemFont: (size: number) => Font;
  static heavyMonospacedSystemFont: (size: number) => Font;
  static blackMonospacedSystemFont: (size: number) => Font;
  static ultraLightRoundedSystemFont: (size: number) => Font;
  static thinRoundedSystemFont: (size: number) => Font;
  static lightRoundedSystemFont: (size: number) => Font;
  static regularRoundedSystemFont: (size: number) => Font;
  static mediumRoundedSystemFont: (size: number) => Font;
  static semiboldRoundedSystemFont: (size: number) => Font;
  static boldRoundedSystemFont: (size: number) => Font;
  static heavyRoundedSystemFont: (size: number) => Font;
  static blackRoundedSystemFont: (size: number) => Font;
}

/** A text shown in a widget. You do not create instances of this element directly. Instead you should call addText() on an instance of a ListWidget. */
declare class WidgetText {
  text: string;
  textColor: Color;
  font: Font;
  textOpacity: number;
  /** Maximum number of lines to display. The limit is disabled when the value is 0 or less. Defaults to 0. */
  lineLimit: number;
  /** Default */
  leftAlignText: () => void;
  centerAlignText: () => void;
  rightAlignText: () => void;
}

declare class WidgetImage {
  image: Image;
  resizable: boolean;
  imageOpacity: number;
  imageSize: Size;
  cornerRadius: number;
  /** Changes the color of the image. Set to null to show the original image. Defaults to null. */
  tintColor: Color | null;
  /** The URL will be opened when the text is tapped. This is only supported in medium and large widgets. Small widgets can only have a single tap target, which is specified by the url on the widget. */
  url: string;
  borderWidth: number;
  borderColor: Color;
  /** When true the corners of the image will be rounded relative to the containing widget. The value of cornerRadius is ignored when this is true. Defaults to false. */
  containerRelativeShape: boolean;
  /** Default */
  leftAlignImage: () => void;
  centerAlignImage: () => void;
  rightAlignImage: () => void;
  /** Default. The image will fit the available space. */
  applyFittingContentMode: () => void;
  /** The image will fill the available space. */
  applyFillingContentMode: () => void;
}

declare class WidgetSpacer {
  length: number | null;
}

/**
 * Date element shown in a widget.
 * A date shown in a widget. Dates will update periodically when shown in a widget.
 * You do not create instances of this element directly. Instead you should call addDate() on an instance of a ListWidget.
 */
declare class WidgetDate {
  date: Date;
  textColor: Color;
  font: Font;
  textOpacity: number;
  lineLimit: number;
  minimumScaleFactor: number;
  shadowColor: Color;
  shadowRadius: number;
  shadowOffset: Point;
  /** The URL will be opened when the text is tapped. This is only supported in medium and large widgets. Small widgets can only have a single tap target, which is specified by the url on the widget. */
  url: string;
  /** Default */
  leftAlignText: () => void;
  centerAlignText: () => void;
  rightAlignText: () => void;
  /**
   * Display time component of the date.
   * Example output: 11:23PM
   */
  applyTimeStyle: () => void;
  /**
   * Display entire date.
   * Example output: June 3, 2019
   * This is default
   */
  applyDateStyle: () => void;
  /**
   * Display date as relative to now.
   * Example output: 2 hours, 23 minutes 1 year, 1 month
   */
  applyRelativeStyle: () => void;
  /**
   * Display date as offset from now.
   * Example output: +2 hours -3 months
   */
  applyOffsetStyle: () => void;
  /**
   * Display date as timer counting from now.
   * Example output: 2:32 36:59:01
   */
  applyTimerStyle: () => void;
}

declare class WidgetStack {
  backgroundColor: Color;
  backgroundImage: Image;
  backgroundGradient: LinearGradient;
  spacing: number;
  /**
   * Specifies the size of the stack when shown in a widget.
   * When a dimension is set to zero or less, the widget will automatically decide a length for that dimension.
   * Both dimensions default to 0.
   */
  size: Size;
  cornerRadius: number;
  borderWidth: number;
  borderColor: Color;
  url: string;
  addText: (text: string) => WidgetText;
  addDate: (date: Date) => WidgetDate;
  addImage: (image: Image) => WidgetImage;
  addSpacer: (length: number | null) => WidgetSpacer;
  addStack: () => WidgetStack;
  setPadding: (
    top: number,
    leading: number,
    bottom: number,
    trailing: number
  ) => void;
  useDefaultPadding: () => void;
  /** Default */
  topAlignContent: () => void;
  centerAlignContent: () => void;
  bottomAlignContent: () => void;
  /** Default */
  layoutHorizontally: () => void;
  layoutVertically: () => void;
}

/**
 * Widget showing a list of elements.
 * A widget showing a list of elements. Pass the widget to Script.setWidget() display it on your Home screen.
 * Be aware that the widget will refresh periodically and the rate at which the widget refreshes is largely determined by the operating system.
 * Also note that there are memory limitations when running a script in a widget. When using too much memory the widget will crash and not render correctly.
 */
declare class ListWidget {
  constructor();
  backgroundColor: Color;
  backgroundImage: Image;
  backgroundGradient: LinearGradient;
  /**
   * Specifies the spacing between elements in the widget.
   * You can also use the addSpacer() function on the widget to add spacing between elements.
   * Defaults to 0.
   */
  spacing: number;
  /**
   * The URL will be opened when the widget is tapped.
   * This will override any behavior defined in the configuration of the widget.
   * E.g. if the widget is configured to run the script when interacting with the widget but a URL is is set, the URL will take precedence.
   */
  url: string;
  /**
   * Earliest date to refresh the widget.
   *
   * The property indicates when the widget can be refreshed again. The widget will not be refreshed
   * before the date have been reached. It is not guaranteed that the widget will refresh at exactly
   * the specified date.
   *
   * The refresh rate of a widget is partly up to iOS/iPadOS. For example, a widget may not refresh
   * if the device is low on battery or the user is rarely looking at the widget.
   *
   * When the property is null the default refresh interval is used. Defaults to null.
   */
  refreshAfterDate: Date;
  /** Adds a text element to the widget. Use the properties on the returned element to style the text.  */
  addText: (text: string) => WidgetText;
  addDate: (date: Date) => WidgetDate;
  addImage: (image: Image) => WidgetImage;
  /** Adds a spacer to the widget. This can be used to offset the content vertically in the widget. null = flexible length */
  addSpacer: (length: number | null) => WidgetSpacer;
  addStack: () => WidgetStack;
  setPadding: (
    top: number,
    /** Left */
    leading: number,
    bottom: number,
    /** Right */
    trailing: number
  ) => void;
  /** Configure the widget to use the default padding. Any padding previously defined with `setPadding()` will be discarded. */
  useDefaultPadding: () => void;
  /**
   * The widget is presented in its small size.
   * Widgets on the Home screen are updated periodically so while working on your widget you may want to preview it in the app.
   */
  presentSmall: () => Promise<void>;
  /**
   * The widget is presented in its small size.
   * Widgets on the Home screen are updated periodically so while working on your widget you may want to preview it in the app.
   */
  presentMedium: () => Promise<void>;
  /**
   * The widget is presented in its small size.
   * Widgets on the Home screen are updated periodically so while working on your widget you may want to preview it in the app.
   */
  presentLarge: () => Promise<void>;
}

//

declare class Timer {
  static schedule: (
    timeInterval: number,
    repeats: boolean,
    callback: () => any
  ) => Timer;
  //
  constructor();
  /** Schedules the timer using its configuration. The supplied function is called when the timer fires. To stop the timer from firing, call the invalidate() function. */
  schedule: (callback: () => any) => void;
  /** Stops the timer from firing ever again. Non-repeating timers are automatically invalidated after they have fired once. Repeating timers must be manually invalidated. */
  invalidate: () => void;
  /** The frequency at which the timer fires, in milliseconds. Be aware that the time interval is specified in setting. Defaults to 0, causing the timer to fire instantly. */
  timeInterval: number;
  /** Whether the timer should repeat. A repeating timer will keep firing until it is invalidated. In contrast to non-repeating timers, repeating timers are not automatically invalidated. Defaults to false. */
  repeats: boolean;
}

//

declare class Photos {
  static latestPhoto: () => Promise<Image>;
}

//

declare class SFSymbol {
  image: Image;
  static named: (symbolName: string) => SFSymbol;
  applyFont: (font: Font) => void;
  applyUltraLightWeight: () => void;
  applyThinWeight: () => void;
  applyLightWeight: () => void;
  applyRegularWeight: () => void;
  applyMediumWeight: () => void;
  applySemiboldWeight: () => void;
  applyBoldWeight: () => void;
  applyHeavyWeight: () => void;
  applyBlackWeight: () => void;
}

//

declare class QuickLook {
  static present: (item: any, fullscreen?: boolean) => Promise<void>;
}

//
// Draw Context
//

type Setter<T> = (value: T) => void;

declare class DrawContext {
  constructor();
  size: Size;
  /**
   * Default false.
   * Devices have a screen scale that is used to convert between the logical coordinate
   * space and the device coordinate space. For example, retina screens have a screen
   * scale of 2 or 3 meaning that one point in the logical coordinate space is
   * represented by four or nine pixels. Respecting the screen scale will multiply
   * the specified size of the canvas by the screen scale. For example a canvas of
   * size 200 by 200 will be 600 by 600 when the image is rendered on a retina screen
   * with a screen scale of 3. When respecting the screen scale is disabled,
   * you may experience that your images looks blurry because essentially the
   * size you have specified will be stretched when rendered on the screen.
   */
  respectScreenScale: boolean;
  /** Default true. */
  opaque: boolean;
  /** Should be called before calling endDrawing() */
  getImage: () => Image;
  /** Image will be scaled to fit the rectangle. */
  drawImageInRect: (image: Image, rect: Rect) => void;
  /** Point = top-left corner of image. */
  drawImageAtPoint: (image: Image, point: Point) => void;
  /**
   * Sets the fill color to be used when performing a fill operation.
   * Any fill operation performed afterwards will fill with the specified
   * color until another call to setFillColor is made.
   */
  setFillColor: Setter<Color>;
  setStrokeColor: Setter<Color>;
  setLineWidth: Setter<number>;
  /** Fills with fill color */
  fillRect: Setter<Rect>;
  fillEllipse: Setter<Rect>;
  /** Adds border to rect. Uses stroke color and line width */
  strokeRect: Setter<Rect>;
  strokeEllipse: Setter<Rect>;
  /**
   * After adding a path to the context, the path can be stroked or filled by
   * calling strokePath and fillPath. Note that only the path that was added
   * latest will be affected by calls to strokePath and fillPath.
   */
  addPath: Setter<Path>;
  strokePath: () => void;
  fillPath: () => void;
  drawText: (text: string, pos: Point) => void;
  /**
   * Call this to draw a text string in a rectangle. Specify how the text should
   * be aligned within the rectangle by calling setTextAlignedLeft,
   * setTextAlignedCenter or setTextAlignedRight before drawing the text.
   */
  drawTextInRect: (text: string, rect: Rect) => void;
  setFont: Setter<Font>;
  setTextColor: Setter<Color>;
  setTextAlignedLeft: () => void;
  setTextAlignedCenter: () => void;
  setTextAlignedRight: () => void;
}

declare class Rect {
  constructor(x: number, y: number, width: number, height: number);
  /** Smallest x-coord in the rectangle. */
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  origin: Point;
  size: Size;
}

declare class Point {
  constructor(x: number, y: number);
  x: number;
  y: number;
}

declare class Path {
  constructor();
  /** Move to a point without drawing a line between the current point & new point */
  move: Setter<Point>;
  /** Add a line from current point */
  addLine: Setter<Point>;
  /**
   * This is a convenience function for adding a rectangle to the path starting
   * from the lower left corner and drawing the lines counter-clockwise until
   * the rectangle is closed. */
  addRect: Setter<Rect>;
  addEllipse: Setter<Rect>;
  addRoundedRect: (
    rect: Rect,
    cornerWidth: number,
    cornerHeight: number
  ) => void;
  /** Adds a cubic Bezier curve to the path with the specified end point and control points. */
  addCurve: (point: Point, control1: Point, control2: Point) => void;
  /** Quadratic Bezier curve */
  addQuadCurve: (point: Point, control: Point) => void;
  /**
   * Adds straight lines between an array of points. Calling this method is
   * equivalent to calling the move function with the first point in the array
   * of points and then calling addLine on the subsequent points in the array.
   */
  addLines: Setter<Point[]>;
  /** Equivalent to repeatedly calling addRect */
  addRects: Setter<Rect[]>;
  /** Add straight line from current point to start of current subpath */
  closeSubpath: () => void;
}

declare class Message {
  constructor();
  /** Phone numbers */
  recipients: string[];
  body: string;
  send: () => Promise<void>;
}

declare class Pasteboard {
  static copy: (str: string) => void;
  static paste: () => string | null;
}

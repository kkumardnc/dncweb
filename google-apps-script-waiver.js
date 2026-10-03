/**
 * Demarest Nature Center — Canoe Waiver Apps Script
 *
 * Receives POST submissions from the canoe waiver form
 * (waiver/index.html), renders the signed waiver as a PDF, saves it to
 * the "waivers" Drive folder, and emails a copy of the PDF to the signer.
 *
 * Deployment
 *   1. Open the waiver project at https://script.google.com.
 *   2. Paste the contents of this file into Code.gs.
 *   3. Set config.sheet_url below to the URL of the waivers spreadsheet.
 *      Run testWaiverEmail once from the editor and approve the new
 *      permission prompts — GmailApp and SpreadsheetApp each need their
 *      own authorization.
 *   4. Deploy > Manage deployments > edit the existing web app >
 *      Version: New version. Editing the existing deployment keeps the
 *      /exec URL that waiver/index.html already points at; creating a
 *      brand-new deployment would change it.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *
 * Sender address
 *   SEND_AS is the address the waiver email comes from. Gmail only lets
 *   a script send from the account that owns it or from a verified
 *   "Send mail as" alias of that account (Gmail Settings > Accounts >
 *   Send mail as). If SEND_AS is neither, the email is sent from the
 *   owning account instead and a warning is logged.
 *
 * Waivers sheet
 *   Every submission is also logged as a row in the "Waivers" tab of the
 *   spreadsheet at config.sheet_url, with columns:
 *     Name | Email | Phone | Waiver Form Name | Timestamp
 *   The tab (and its header row) is created on first run if missing.
 *   A sheet failure is logged but does not fail the request.
 *
 * Testing (run from the editor: pick the function, click Run, then open
 * View > Logs / Execution log)
 *   testWaiverEmail  Sends only the waiver email, with a small test PDF
 *                    attached, to TEST_EMAIL (or your own address if
 *                    blank). Writes nothing to Drive or the sheet.
 *   testDoPost       Runs a full fake submission through doPost: builds
 *                    and saves the PDF, appends a sheet row, and sends the
 *                    email. Delete the test PDF and row afterwards.
 */

const config = {
  sheet_url: 'REPLACE_WITH_YOUR_GOOGLE_SHEET_URL'
};
const WAIVERS_SHEET_NAME = 'Waivers';
const WAIVER_FORM_NAME = 'Canoe Waiver';

const SEND_AS = 'info@demarestnaturecenter.org';
const SEND_AS_NAME = 'Demarest Nature Center';

// Recipient for testWaiverEmail / testDoPost. Blank = the script owner.
const TEST_EMAIL = '';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  var formData = JSON.parse(e.postData.contents);

  // Create a temporary Google Doc
  var doc = DocumentApp.create('Temporary_' + formData.name + '_canoe_waiver');
  var body = doc.getBody();

  // Set the font for the entire document
  body.setFontFamily('Arial');

  // Add logo, centered, in the document's initial empty paragraph (a new
  // paragraph would leave that one behind as a blank line). Scale it to a
  // fixed width while keeping the logo's aspect ratio so it isn't squashed.
  var logoUrl = "https://www.demarestnaturecenter.org/assets/images/logo.png";
  var logoBlob = UrlFetchApp.fetch(logoUrl).getBlob();
  var logoParagraph = body.getParagraphs()[0];
  logoParagraph.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  var logoImage = logoParagraph.appendInlineImage(logoBlob);
  var logoWidth = 110;
  logoImage.setHeight(Math.round(logoWidth * logoImage.getHeight() / logoImage.getWidth()));
  logoImage.setWidth(logoWidth);

  // Add a title
  var title = body.appendParagraph('Demarest Nature Center - Assumption of Risk and Complete Release Form');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  title.setFontSize(16);
  title.setBold(true);
  title.setSpacingBefore(12);

  // Add spacing
  body.appendParagraph('').setLineSpacing(2);

  // Add form data
  body.appendParagraph('Name: ' + formData.name).setFontSize(12);
  body.appendParagraph('Email: ' + formData.email).setFontSize(12);
  body.appendParagraph('Phone: ' + formData.phone).setFontSize(12);
  body.appendParagraph('Date: ' + formData.date).setFontSize(12);

  // Add spacing
  body.appendParagraph('').setLineSpacing(2);

  // Add waiver text
  var introText = body.appendParagraph('In consideration of permission to use the canoes provided during the Oktoberfest, held by the Demarest Nature Center the undersigned hereby expressly agrees:');
  introText.setFontSize(12);
  introText.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);

  // Add spacing
  body.appendParagraph('').setLineSpacing(1.5);

  var waiverText = [
    '1) THAT canoeing is a participation sport, and I am fully aware of the risks and hazards involved in or arising from my use, participation, or presence upon the canoes. I HEREBY ASSUME ANY AND ALL RISKS INVOLVED IN OR ARISING FROM MY USE OF OR PRESENCE UPON THE DEMAREST DUCK POND AND CANOES including, without limitation, the risks of bodily injury, death and/or loss or damage to personal property with respect to myself and any and all passengers in the canoe.',
    '2) TO RELEASE THE DEMAREST NATURE CENTER and all of its successors, assigns, affiliates, officers, directors, trustees, instructors, employees, members and agents from, and AGREE NOT TO SUE ANY OR ALL OF THEM on account of or in connection with any claims, causes of action, injuries, damages, costs or expenses arising from my use of or presence upon the canoes or the Demarest Duck Pond, including but not limited to those claims for bodily injury, whether or not caused by the negligence or other fault of the Demarest Nature Center, with respect to myself and any and all passengers in the canoe.',
    '3) THIS RELEASE shall be binding upon my heirs, administrators, executors, assigns and legal representatives.',
    '4) I have read and understand this agreement. I understand that by making and signing this agreement I have given up substantial rights. I have signed it freely and without any inducement or assurance of any nature and intend it to be a complete and unconditional release of all liability to the greatest extent allowed by law and agree that if any portion of this agreement is held to be invalid the other portions shall remain in full force and effect.'
  ];

  waiverText.forEach(function(paragraph) {
    var p = body.appendParagraph(paragraph);
    p.setFontSize(12);
    p.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);
    p.setIndentFirstLine(36);  // Indent first line by 0.5 inches (36 points)
    body.appendParagraph('').setLineSpacing(1.5);  // Add space after each paragraph
  });

  // Add signature
  body.appendParagraph('Signature:').setFontSize(12);
  var signatureBlob = Utilities.newBlob(Utilities.base64Decode(formData.signature.split(',')[1]), 'image/png');
  body.appendImage(signatureBlob);

  // Add new fields
  body.appendParagraph('').setLineSpacing(2);  // Add extra space
  body.appendParagraph('PARENT/GUARDIAN (if participant is under the age of 18): ' + (formData.parentGuardian || '_____________________')).setFontSize(12);
  body.appendParagraph('Name(s) of participant(s) under the age of 18:').setFontSize(12);
  body.appendParagraph(formData.underageParticipants || '___________________________________________').setFontSize(12);

  // Save and close the document
  doc.saveAndClose();

  // Get current timestamp
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");

  // Get or create the "waivers" folder (next() throws when no folder exists,
  // so check hasNext() first)
  var folders = DriveApp.getFoldersByName("waivers");
  var waiversFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder("waivers");

  // Convert the Google Doc to PDF
  var pdfName = formData.name + '_' + formData.email + '_' + timestamp + '_canoe_waiver.pdf';
  var pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf').setName(pdfName);

  // Save the PDF to the "waivers" folder
  var pdfFile = waiversFolder.createFile(pdf);

  // Delete the temporary Google Doc
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  // Log the submission to the Waivers sheet. A sheet failure is logged
  // but does not fail the request — the PDF is already saved.
  try {
    getWaiversSheet_().appendRow([
      formData.name,
      formData.email,
      formData.phone,
      WAIVER_FORM_NAME,
      new Date()
    ]);
  } catch (err) {
    console.error('Failed to log waiver for ' + formData.email + ' to sheet: ' + err);
  }

  // Email a copy of the signed waiver to the signer. A mail failure is
  // logged but does not fail the request — the PDF is already saved.
  var emailSent = false;
  var email = String(formData.email || '').trim();
  if (EMAIL_REGEX.test(email)) {
    try {
      GmailApp.sendEmail(
        email,
        'Your signed canoe waiver - Demarest Nature Center',
        'Hi ' + formData.name + ',\n\n' +
        'Thank you for signing the Demarest Nature Center canoe waiver. ' +
        'A copy of your signed waiver is attached for your records.\n\n' +
        'Enjoy the canoe rides!\n\n' +
        'Demarest Nature Center\n' +
        'https://www.demarestnaturecenter.org',
        buildSendOptions_([pdfFile.getAs('application/pdf')])
      );
      emailSent = true;
    } catch (err) {
      console.error('Failed to email waiver to ' + email + ': ' + err);
    }
  }

  // Return the URL of the created PDF
  return ContentService.createTextOutput(JSON.stringify({
    result: 'success',
    pdfUrl: pdfFile.getUrl(),
    emailSent: emailSent
  })).setMimeType(ContentService.MimeType.JSON);
}

// Gmail options for the waiver email. Sets `from` to SEND_AS only when the
// script's account can send as it — GmailApp throws on any other address.
function buildSendOptions_(attachments) {
  var options = {
    name: SEND_AS_NAME,
    replyTo: SEND_AS,
    attachments: attachments
  };
  var sendAs = SEND_AS.toLowerCase();
  var owner = Session.getEffectiveUser().getEmail().toLowerCase();
  var aliases = GmailApp.getAliases().map(function(a) { return a.toLowerCase(); });
  if (sendAs !== owner) {
    if (aliases.indexOf(sendAs) !== -1) {
      options.from = SEND_AS;
    } else {
      console.warn(SEND_AS + ' is not a Gmail alias of ' + owner + '; sending from ' + owner);
    }
  }
  return options;
}

// Returns the "Waivers" tab of the spreadsheet at config.sheet_url,
// creating it with a header row if it does not exist yet.
function getWaiversSheet_() {
  var ss = SpreadsheetApp.openByUrl(config.sheet_url);
  var sheet = ss.getSheetByName(WAIVERS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(WAIVERS_SHEET_NAME);
    sheet.appendRow(['Name', 'Email', 'Phone', 'Waiver Form Name', 'Timestamp']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Editor test: sends the waiver email with a small test PDF attached and
// logs who it went to, which address it was sent from, and the remaining
// daily mail quota. Throws (so the run shows as failed) if sending fails.
function testWaiverEmail() {
  var to = TEST_EMAIL || Session.getEffectiveUser().getEmail();
  var pdf = HtmlService.createHtmlOutput('<p>Test waiver PDF from the canoe waiver script.</p>')
    .getAs('application/pdf')
    .setName('test_canoe_waiver.pdf');
  var options = buildSendOptions_([pdf]);

  GmailApp.sendEmail(
    to,
    '[TEST] Your signed canoe waiver - Demarest Nature Center',
    'This is a test of the canoe waiver email. A test PDF is attached.\n\n' +
    'Demarest Nature Center\n' +
    'https://www.demarestnaturecenter.org',
    options
  );

  console.log('Test email sent to ' + to +
    ' from ' + (options.from || Session.getEffectiveUser().getEmail()) +
    ' (reply-to ' + options.replyTo + ')');
  console.log('Remaining daily email quota: ' + MailApp.getRemainingDailyQuota());
}

// Editor test: runs a fake submission end to end through doPost (PDF,
// Drive folder, Waivers sheet row and email) and logs the response.
function testDoPost() {
  // 1x1 transparent PNG standing in for the drawn signature
  var signature = 'data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  var formData = {
    name: 'Test Signer',
    email: TEST_EMAIL || Session.getEffectiveUser().getEmail(),
    phone: '555-555-5555',
    signature: signature,
    date: new Date().toLocaleDateString(),
    parentGuardian: '',
    underageParticipants: ''
  };
  var response = doPost({ postData: { contents: JSON.stringify(formData) } });
  console.log(response.getContent());
}

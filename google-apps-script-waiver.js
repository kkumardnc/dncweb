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
 *   3. Run doPost once from the editor (or redeploy) and approve the new
 *      Gmail permission prompt — GmailApp needs its own authorization.
 *   4. Deploy > Manage deployments > edit the existing web app >
 *      Version: New version. Editing the existing deployment keeps the
 *      /exec URL that waiver/index.html already points at; creating a
 *      brand-new deployment would change it.
 *        - Execute as: Me
 *        - Who has access: Anyone
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  var formData = JSON.parse(e.postData.contents);

  // Create a temporary Google Doc
  var doc = DocumentApp.create('Temporary_' + formData.name + '_canoe_waiver');
  var body = doc.getBody();

  // Set the font for the entire document
  body.setFontFamily('Arial');

  // Add logo
  var logoUrl = "https://www.demarestnaturecenter.org/assets/images/logo.png";
  var logoBlob = UrlFetchApp.fetch(logoUrl).getBlob();
  var logoImage = body.insertImage(0, logoBlob);
  logoImage.setWidth(200);
  logoImage.setHeight(100);

  // Add a title
  var title = body.appendParagraph('Demarest Nature Center - Assumption of Risk and Complete Release Form');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

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
        {
          name: 'Demarest Nature Center',
          attachments: [pdfFile.getAs('application/pdf')]
        }
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

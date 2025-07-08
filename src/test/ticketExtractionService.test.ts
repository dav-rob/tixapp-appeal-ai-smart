/**
 * Test for Ticket Extraction Service
 * Tests API connectivity and response parsing for https://api.tixappeal.com/extract_ticket
 */

import { ticketExtractionService } from '@/services/ticketExtractionService';

// Sample OCR text from tests/sample-ticket-OCR.txt
const SAMPLE_OCR_TEXT = `Notice to Owner

Lambeth This notice is for a parking contravention

Traffic Management Act 2004
Part 1

Parking

Date of this Notice: 21/11/2022
Penalty Charge Notice: LJ24475960
Vehicle Registration Number: DG66ZXV
THE PENALTY CHARGE HAS NOT BEEN
PAID
DO NOT IGNORE THIS NOTICE
responsible for dealing
pass it on to the
person who was in control of the vehicle at
the time the alleged contravention occurred.

DAVID ROBERTS
FLAT 2/A
36 BUCKINGHAM GATE
LONDON
SW1E 6PB
000001689338-459

You are legally
with this notice. Do not

Details of Contravention
On 19/10/2022 a PCN was issued by Civil Enforcement officer LH2316 to the above vehicle for the following alleged
Contravention:
Contravention Code
12s Parked in a residents' shared use parking
or Description:

place or zone without a valid virtual permit
or voucher or pay and display ticket issued
of the parking charge

or clearly displaying
for that place where
At: 12: 41

required, valid

or without payment permit

On: 19/10/2022
Location: Blakemore Road ()

Penalty Charge
Penalty Charge Amount: £ 130.00
Amount Paid: £ 0.00 PAYMENT DUE NOW:
which the
must be made by above.
you do not pay the penalty charge in full, or
authority
Period the representations to
50% to
enforce by payment

last 130.00

of

The
received outside authority the 28 Day Period described

may disregard any representations

Notice day

to the

The penalty charge must be paid not later
Payment on

period of 28 days beginning with the
Owner is served ("The 28 Day Period").
one of the methods set out overleaf.
representations section overleaf). If you
to the
Notice (see How Challenge penalty
OR You may
think you should have to
representations to us using the
YOU WISH TO CHALLENGE THE

If
if
may increase authority,
£195.00 and may steps to
take penalty
of the increased charge.

you have not
within the 28 Day

make
To

do against this
make
form.
you may

attached this

Representations charge,

DO NOT MAKE PAYMENT IF
PENALTY CHARGE.

Penalty Charge Notice: LJ24475960
Vehicle Registration Number: DG66ZXV
Date of Contravention: 19/10/2022

For payment options
You must complete this slip in
payment to the
Lambeth Parking, PO 549,
Box below.

Payment Slip
block overleaf
Darlington, DL1 9TU

capitals and return it with your

Name
Address

Postcode

40`;

/**
 * Test the ticket extraction service with detailed logging
 */
export async function testTicketExtractionService(): Promise<void> {
  console.log('=== Ticket Extraction Service Test ===');
  
  try {
    // Test 1: Check API key configuration
    console.log('1. Checking API key configuration...');
    const apiKey = import.meta.env.VITE_CURRENT_CUSTOM_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_CURRENT_CUSTOM_API_KEY not found in environment');
    }
    console.log('✓ API key found:', apiKey.substring(0, 8) + '...');
    
    // Test 2: Test network connectivity
    console.log('2. Testing network connectivity...');
    console.log('Sample OCR text length:', SAMPLE_OCR_TEXT.length);
    console.log('First 200 chars:', SAMPLE_OCR_TEXT.substring(0, 200));
    
    // Test 3: Call the API
    console.log('3. Calling ticket extraction API...');
    const startTime = Date.now();
    
    const result = await ticketExtractionService.extractTicketData(SAMPLE_OCR_TEXT);
    
    const endTime = Date.now();
    console.log(`✓ API call successful in ${endTime - startTime}ms`);
    
    // Test 4: Validate response
    console.log('4. Validating API response...');
    console.log('Response structure:', {
      ticket_category: result.ticket_category,
      pcn_number: result.pcn_number,
      car_vrm: result.car_vrm,
      contravention_code: result.contravention_code,
      has_datetime: !!result.contravention_datetime,
      has_location: !!result.location,
      has_council: !!result.council
    });
    
    // Test 5: Test data formatting
    console.log('5. Testing data formatting...');
    const formattedData = ticketExtractionService.formatTicketDataForDisplay(result);
    console.log(`✓ Formatted data has ${formattedData.length} fields`);
    
    console.log('=== Test Completed Successfully ===');
    console.log('Full API Response:', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('=== Test Failed ===');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Additional debugging for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('This appears to be a network/fetch error. Possible causes:');
      console.error('- Network connectivity issues');
      console.error('- API server is down or unreachable');
      console.error('- Invalid API key or authentication failure');
    }
    
    throw error;
  }
}

/**
 * Manual test function that can be called from browser console
 */
export function runManualTest(): void {
  testTicketExtractionService()
    .then(() => {
      console.log('Manual test completed successfully');
    })
    .catch((error) => {
      console.error('Manual test failed:', error);
    });
}

// Auto-run test in development mode
if (import.meta.env.DEV) {
  console.log('Ticket extraction service test available - use ServiceTest component or runManualTest() in console');
}
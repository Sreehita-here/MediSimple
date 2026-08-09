# MediSimple Feature Expansion Plan

This plan details the implementation of the three new requested features: unrestricted medicine search, medication reminders, and Prescription OCR analysis.

> [!IMPORTANT]
> **API Key Requirement**: To achieve highly accurate OCR and analysis of both Images and PDFs for prescriptions, I propose using the Google Gemini API (since it has native multimodal capabilities perfectly suited for this). You will need to add `GEMINI_API_KEY` to your `.env.local` file.

## Open Questions
1. **Reminders Implementation**: Fully backgrounded push notifications (when the browser is completely closed) require a complex push server setup. For this build, I propose using the standard Browser `Notification` API, which will alert you at the correct times as long as the MediSimple tab is open or running in the background. Is this acceptable?
2. **Gemini API**: Do you have a Google Gemini API key available for the Prescription OCR feature, or would you prefer I attempt to use a free OCR library + Groq (which is much less accurate on handwritten or complex PDFs)?

## Proposed Changes

---

### 1. Unrestricted Medicine Search
Currently, the search bar only allows selecting medicines that are pre-seeded in the database.

#### [MODIFY] [components/MedicineSearchInput.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/components/MedicineSearchInput.js)
- Add a "Search internet for '[query]'" fallback option in the autocomplete dropdown when the user types a medicine that isn't in the database.
- When clicked, this will pass the raw text to the `explanation` page, triggering the existing Groq AI fallback workflow.

#### [MODIFY] [pages/medicine-input.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/pages/medicine-input.js)
- Update the UI to seamlessly handle arbitrary text inputs without disabling the "Understand This Medicine" button.

---

### 2. Medication Reminders (Notifications)
We will add the ability to set specific time-based reminders and receive browser notifications.

#### [MODIFY] [models/UserMedicine.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/models/UserMedicine.js)
- Add a `reminderTimes` array field (e.g., `["08:00", "20:00"]`) to store specific alarm times.

#### [MODIFY] [pages/my-medicines.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/pages/my-medicines.js)
- Update the "Add Medicine" form to include an optional time picker for reminders.
- Display the configured reminder times on the active medicine cards.

#### [NEW] [components/ReminderSystem.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/components/ReminderSystem.js)
- A global component that requests `Notification` permissions on load.
- Runs a background interval checking the current time against the user's saved `reminderTimes` (fetched from the API) and fires a native browser notification (e.g., "Time to take Paracetamol 500mg!").

#### [MODIFY] [pages/_app.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/pages/_app.js)
- Wrap the app with `<ReminderSystem>` so alarms work on any page.

---

### 3. Prescription Analysis (OCR)
A new feature to upload medical documents, extract the medicines, and easily add them to your profile.

#### [NEW] [pages/prescription.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/pages/prescription.js)
- A new page featuring a drag-and-drop file uploader accepting `.jpg, .png, .pdf`.
- Displays a loading state while analyzing, then presents a list of extracted medicines.
- Provides "Understand" and "Add to My Meds" buttons for each extracted item.

#### [NEW] [pages/api/prescription/analyze.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/pages/api/prescription/analyze.js)
- An endpoint that receives the uploaded file (encoded in base64).
- Uses the `@google/genai` SDK to send the image/PDF to Gemini 1.5 Flash with a prompt instructing it to extract all medications, dosages, and frequencies into a strict JSON format.

#### [MODIFY] [components/Layout.js](file:///c:/Users/gonap/OneDrive/Desktop/dev/medisimple/components/Layout.js)
- Add a new "Scan Rx" button to the bottom navigation bar and desktop header.

## Verification Plan
### Automated Tests
- None
### Manual Verification
1. **Search**: Search for a completely obscure medicine not in the DB and verify it successfully routes to the Groq explanation page.
2. **Reminders**: Add a medicine with a reminder set 1 minute from the current time. Verify the browser shows a native notification popup.
3. **Prescription OCR**: Upload a sample image of a prescription to the new `/prescription` route and verify it accurately detects the medications and renders them in the UI.

import { toast } from "sonner";

/**
 * Simulates the initialization of the DigiLocker widget/script.
 * In a real scenario, this would load the JS library from a CDN.
 */
export const initDigiLocker = () => {
    console.log("DigiLocker script initialized");
};

/**
 * Simulates fetching a document from DigiLocker.
 * This mocks the popup flow, user authentication, and document selection.
 * @param {string} docType - The type of document to fetch (e.g., "Aadhaar Card")
 * @returns {Promise<{success: boolean, docId: string, verified: boolean}>}
 */
export const fetchDocumentFromDigiLocker = (docType) => {
    return new Promise((resolve, reject) => {
        // Simulate network delay and user interaction time
        const delay = 2000;

        // Simulate opening a popup
        const popup = window.open("", "DigiLocker", "width=600,height=600");
        if (popup) {
            popup.document.write(`
        <html>
          <head><title>DigiLocker Simulation</title></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5;">
            <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
              <h2 style="color: #2563eb;">DigiLocker</h2>
              <p>Authenticating user...</p>
              <div style="margin-top: 1rem; color: #64748b;">Please wait while we fetch your ${docType}...</div>
              <div class="loader" style="margin-top: 1rem; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 2s linear infinite;"></div>
              <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
            </div>
          </body>
        </html>
      `);
        }

        setTimeout(() => {
            if (popup) popup.close();

            // randomize success to simulate real world (mostly success for demo)
            const isSuccess = true;

            if (isSuccess) {
                toast.success(`Successfully fetched ${docType} from DigiLocker`);
                resolve({
                    success: true,
                    docId: `DL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    verified: true,
                    timestamp: new Date().toISOString()
                });
            } else {
                toast.error("Failed to connect to DigiLocker");
                reject(new Error("User cancelled or connection failed"));
            }
        }, delay);
    });
};

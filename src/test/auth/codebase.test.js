import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Codebase Checks', () => {
    it('No OTP references in codebase', () => {
        // recursively check the src directory
        function searchFilesInDirectory(dir, filter, contentChecker) {
            if (!fs.existsSync(dir)) return;
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.lstatSync(fullPath).isDirectory()) {
                    searchFilesInDirectory(fullPath, filter, contentChecker);
                } else if (filter.test(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    contentChecker(fullPath, content);
                }
            }
        }

        let signInWithOtpOccurrences = 0;
        searchFilesInDirectory(
            path.resolve(__dirname, '../../'),
            /\.(jsx?|tsx?)$/,
            (filePath, content) => {
                // Exclude this test file itself and register.test.jsx which might contain 'signInWithOtp' strictly in comments or old tests
                if (!filePath.includes('test')) {
                    if (content.includes('signInWithOtp')) {
                        signInWithOtpOccurrences++;
                    }
                }
            }
        );

        expect(signInWithOtpOccurrences).toBe(0);
    });
});

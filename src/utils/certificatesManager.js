const generateCertificateCode = (certifierCode, courseCode, issueDate, startCount) => {
    // Extract month and year from date
    const month = String(issueDate.getMonth() + 1).padStart(2, '0');
    const year = issueDate.getFullYear();
    
    // Format correlative with leading zeros
    const correlative = String(startCount).padStart(6, '0');
    
    return `${certifierCode}-${courseCode}-${month}-${year}-${correlative}`;
}

const generateCourseAbbreviation = (courseName) => {
    const ignoreWords = ['de', 'y', 'en', 'el', 'para', 'a'];
    const keywords = courseName.split(' ')
        .filter(word => !ignoreWords.includes(word.toLowerCase()))
        .map(word => word.toUpperCase());

    // Get first 3 letters from initials (e.g., "F" + "S" + "H" → "FSH")
    let abbr = keywords.slice(0, 3).map(word => word[0]).join('');

    // Add 3 more letters from the first keyword (e.g., "FOO" from "Food")
    if (keywords.length > 0 && keywords[0].length >= 3) {
        abbr += keywords[0].substring(0, 3);
    } else {
        abbr = abbr.padEnd(6, 'X'); // Pad if needed
    }

    return abbr.slice(0, 6); // Ensure 6 characters
}

const parseSigners = (signatures) => {
    return signatures.map(signature => ({
        urlSignature: signature.URL,
        text: [
            signature.signerName,
            ...signature.signerTitle.split(',').map(title => title.trim())
        ]
    }));
}


module.exports = {
    generateCertificateCode,
    generateCourseAbbreviation,
    parseSigners
};  
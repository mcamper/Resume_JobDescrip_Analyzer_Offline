document.addEventListener("DOMContentLoaded", () => {

  const resumeInput = document.getElementById("resumeText");
  const jobInput = document.getElementById("jobText");
  const analyzeButton = document.getElementById("analyzeBtn");
  const clearButton = document.getElementById("clearBtn");
  const resultsBox = document.getElementById("resultsBox");
  const highlightedOutput = document.getElementById("highlightedResume");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const spinner = document.getElementById("spinner");
  const matchProgress = document.getElementById("matchProgress");
  const exportPDFBtn = document.getElementById("exportPDFBtn");
  const exportWordBtn = document.getElementById("exportWordBtn");

  // ---------- Utilities ----------
  function escapeHTML(text) {
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;");
  }

  function highlightMatches(resume, keywords) {
    let safeResume = escapeHTML(resume);
    keywords.forEach(word => {
      if (!word.trim()) return;
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      safeResume = safeResume.replace(regex, `<span class="highlight">$1</span>`);
    });
    return safeResume;
  }

  function calculateMatchScore(resume, keywords) {
    if (!keywords.length) return 0;
    const resumeWords = resume.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const matches = resumeWords.filter(word => keywords.includes(word));
    return Math.round((matches.length / keywords.length) * 100);
  }

  // ---------- Analyze ----------
  analyzeButton.addEventListener("click", () => {
    const resume = resumeInput.value;
    const job = jobInput.value;

    if (!resume || !job) {
      resultsBox.textContent = "Please paste both your resume and a job description.";
      return;
    }

    spinner.classList.remove("hidden");

    setTimeout(() => { // simulate loading
      const jobWords = job.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      const uniqueKeywords = [...new Set(jobWords)];

      // Highlight
      const highlightedHTML = highlightMatches(resume, uniqueKeywords);
      highlightedOutput.innerHTML = highlightedHTML;

      // Match score
      const score = calculateMatchScore(resume, uniqueKeywords);
      matchProgress.style.width = score + "%";
      matchProgress.textContent = score + "%";

      resultsBox.textContent = "Matched keywords are highlighted below in your resume preview.";
      spinner.classList.add("hidden");
    }, 500);
  });

  // ---------- Clear ----------
  clearButton.addEventListener("click", () => {
    resumeInput.value = "";
    jobInput.value = "";
    resultsBox.textContent = "";
    highlightedOutput.innerHTML = "";
    matchProgress.style.width = "0";
    matchProgress.textContent = "0%";
  });

  // ---------- Dark Mode Toggle ----------
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // ---------- Export to PDF (multi-page support) ----------
  exportPDFBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);

    let y = 10; // starting y
    const pageHeight = doc.internal.pageSize.height;

    function addTextMultiPage(lines) {
      for (let line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 6;
      }
      y += 4; // extra space between sections
    }

    doc.text("Resume vs Job Description Analysis", 10, y);
    y += 10;

    doc.text("Resume:", 10, y);
    y += 6;
    const resumeLines = doc.splitTextToSize(resumeInput.value, 180);
    addTextMultiPage(resumeLines);

    doc.text("Job Description:", 10, y);
    y += 6;
    const jobLines = doc.splitTextToSize(jobInput.value, 180);
    addTextMultiPage(jobLines);

    doc.save("resume_analysis.pdf");
  });

  // ---------- Export to Word ----------
  exportWordBtn.addEventListener("click", () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Resume Analysis</title></head>
      <body>
        <h2>Resume vs Job Description Analysis</h2>
        <h3>Resume:</h3>
        <pre>${escapeHTML(resumeInput.value)}</pre>
        <h3>Job Description:</h3>
        <pre>${escapeHTML(jobInput.value)}</pre>
      </body></html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_analysis.doc';
    a.click();
    URL.revokeObjectURL(url);
  });

});

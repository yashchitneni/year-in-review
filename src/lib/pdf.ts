import { PDFDocument, rgb } from 'pdf-lib';
import type { FormData } from '@/lib/store';

export async function generateAndDownloadPDF(formData: FormData) {
  try {
    // Create a new PDF document
    const doc = await PDFDocument.create();
    
    // Add a page to the document
    let currentPage = doc.addPage([595.28, 841.89]); // A4 size in points
    
    // Get the font
    const font = await doc.embedFont('Helvetica');
    
    // Set initial position
    let y = currentPage.getHeight() - 50;
    const margin = 50;
    const lineHeight = 15;
    
    // Helper function to add text and handle overflow
    const addText = async (text: string = '', fontSize: number = 12, indent: number = 0) => {
      if (!text) return;
      
      const words = text.split(' ');
      let line = '';
      const effectiveMargin = margin + indent;
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const width = font.widthOfTextAtSize(testLine, fontSize);
        
        if (width > currentPage.getWidth() - 2 * margin) {
          currentPage.drawText(line, {
            x: effectiveMargin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          
          line = word + ' ';
          y -= lineHeight;
          
          // Check if we need a new page
          if (y < margin) {
            currentPage = doc.addPage([595.28, 841.89]);
            y = currentPage.getHeight() - 50;
          }
        } else {
          line = testLine;
        }
      }
      
      // Draw remaining text
      if (line.trim().length > 0) {
        currentPage.drawText(line, {
          x: effectiveMargin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      }
      
      y -= lineHeight; // Add extra space after paragraph
    };

    // Helper function to add a section
    const addSection = async (title: string, content: string | Record<string, any>) => {
      await addText(title, 18);
      y -= lineHeight;

      if (typeof content === 'string') {
        await addText(content, 12, 10);
      } else if (Array.isArray(content)) {
        for (const item of content) {
          await addText(`• ${item}`, 12, 10);
        }
      } else if (typeof content === 'object') {
        for (const [key, value] of Object.entries(content)) {
          await addText(key + ':', 14);
          if (typeof value === 'string') {
            await addText(value, 12, 10);
          } else if (Array.isArray(value)) {
            for (const item of value) {
              await addText(`• ${item}`, 12, 20);
            }
          }
        }
      }
      y -= lineHeight * 2;
    };

    // Title Page
    await addText('Year Compass 2024-2025', 24);
    y -= lineHeight * 3;

    // Past Year Section
    await addSection('The Past Year', {
      'Calendar Review': formData.pastYear.calendarReview,
      'Year Overview': formData.pastYear.yearOverview,
      'Three Words': formData.pastYear.threeWords,
      'Best Moments': formData.pastYear.bestMoments,
      'Biggest Challenges': formData.pastYear.biggestChallenges,
      'Biggest Surprises': formData.pastYear.biggestSurprise,
      'Most Important Lesson': formData.pastYear.biggestLesson,
      'Most Grateful For': formData.pastYear.mostGratefulFor,
      'Best Discovery': formData.pastYear.bestDiscovery,
      'Who Helped': formData.pastYear.whoHelped,
      'People Who Influenced': formData.pastYear.peopleWhoInfluenced,
    });

    // Year Ahead Section
    await addSection('The Year Ahead', {
      'Dream Big': formData.yearAhead.dreamBig,
      'Word of the Year': formData.yearAhead.wordOfYear,
      'Secret Wish': formData.yearAhead.secretWish,
      'Year Overview': formData.yearAhead.yearOverview,
      'Magical Triplets': {
        'Love About Self': formData.yearAhead.magicalTriplets.loveAboutSelf,
        'Let Go Of': formData.yearAhead.magicalTriplets.letGoOf,
        'Achieve Most': formData.yearAhead.magicalTriplets.achieveMost,
        'Pillars in Rough Times': formData.yearAhead.magicalTriplets.pillarsInRoughTimes,
        'Dare to Discover': formData.yearAhead.magicalTriplets.dareToDiscover,
      },
      'Six Sentences': formData.yearAhead.sixSentences,
    });

    // Closing Section
    await addSection('Closing', {
      'Date': formData.closing.date || '',
      'Sharing': formData.closing.sharing ? {
        'Website': formData.closing.sharing.website,
        'Hashtag': formData.closing.sharing.hashtag,
      } : {},
    });
    
    // Generate PDF bytes
    const pdfBytes = await doc.save();
    
    // Create blob and trigger download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YearCompass-${new Date().toISOString().split('T')[0]}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
} 
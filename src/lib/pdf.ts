import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { FormData } from '@/lib/store';

export async function generateAndDownloadPDF(formData: FormData) {
  try {
    const doc = await PDFDocument.create();
    let currentPage = doc.addPage([595.28, 841.89]); // A4 size
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    
    let y = currentPage.getHeight() - 50;
    const margin = 50;
    const lineHeight = 15;
    
    // Helper function to sanitize text while preserving line breaks
    const sanitizeText = (text: string = ''): string => {
      return text
        .replace(/[^\x20-\x7E\n]/g, '') // Keep spaces, printable chars, and newlines
        .trim();
    };
    
    // Helper function to add text with line breaks
    const addText = async (text: string = '', fontSize: number = 12, indent: number = 0, isBold: boolean = false) => {
      if (!text) return;
      
      const sanitizedText = sanitizeText(text);
      const lines = sanitizedText.split('\n');
      const selectedFont = isBold ? boldFont : font;
      
      for (const line of lines) {
        if (!line.trim()) {
          y -= lineHeight;
          continue;
        }
        
        const words = line.split(' ');
        let currentLine = '';
        const effectiveMargin = margin + indent;
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const width = selectedFont.widthOfTextAtSize(testLine, fontSize);
          
          if (width > currentPage.getWidth() - (2 * margin)) {
            if (currentLine.trim()) {
              currentPage.drawText(currentLine.trim(), {
                x: effectiveMargin,
                y,
                size: fontSize,
                font: selectedFont,
                color: rgb(0, 0, 0),
              });
              y -= lineHeight;
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine.trim()) {
          // Check if we need a new page
          if (y < margin) {
            currentPage = doc.addPage([595.28, 841.89]);
            y = currentPage.getHeight() - 50;
          }
          
          currentPage.drawText(currentLine.trim(), {
            x: effectiveMargin,
            y,
            size: fontSize,
            font: selectedFont,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }
      }
      
      y -= lineHeight; // Extra space after paragraph
    };

    // Helper function to add a section with proper formatting
    const addSection = async (title: string, content: any) => {
      // Add section title
      await addText(title, 18, 0, true);
      y -= lineHeight;

      if (typeof content === 'string') {
        await addText(content, 12, 10);
      } else if (Array.isArray(content)) {
        for (const item of content) {
          if (item) await addText(`• ${item}`, 12, 10);
        }
      } else if (typeof content === 'object') {
        for (const [key, value] of Object.entries(content)) {
          if (!key || !value) continue;
          
          // Add subsection title
          await addText(key, 14, 0, true);
          
          if (typeof value === 'string') {
            await addText(value, 12, 10);
          } else if (Array.isArray(value)) {
            for (const item of value) {
              if (item) await addText(`• ${item}`, 12, 20);
            }
          } else if (typeof value === 'object') {
            for (const [subKey, subValue] of Object.entries(value)) {
              if (subKey && subValue) {
                await addText(`${subKey}:`, 12, 20, true);
                await addText(subValue.toString(), 12, 30);
              }
            }
          }
          y -= lineHeight;
        }
      }
      y -= lineHeight * 2;
    };

    // Title
    await addText('YearCompass 2024-2025', 24, 0, true);
    y -= lineHeight * 3;

    // Past Year Section
    await addSection('The Past Year', {
      'Going through your calendar': formData.pastYear.calendarReview,
      'Year Overview': {
        'Personal Life, Family': formData.pastYear.yearOverview.personalFamily,
        'Career, Studies': formData.pastYear.yearOverview.careerStudies,
        'Friends, Community': formData.pastYear.yearOverview.friendsCommunity,
        'Relaxation, Hobbies, Creativity': formData.pastYear.yearOverview.relaxationHobbiesCreativity,
        'Physical Health, Fitness': formData.pastYear.yearOverview.physicalHealthFitness,
        'Mental Health, Self-Knowledge': formData.pastYear.yearOverview.mentalHealthSelfKnowledge,
        'Habits That Define You': formData.pastYear.yearOverview.habitsThatDefineYou,
        'A Better Tomorrow': formData.pastYear.yearOverview.betterTomorrow,
      },
      'Six Sentences About My Past Year': {
        'The wisest decision I made...': formData.pastYear.wisestDecision,
        'The biggest lesson I learned...': formData.pastYear.biggestLesson,
        'The biggest risk I took...': formData.pastYear.biggestRisk,
        'The biggest surprise of the year...': formData.pastYear.biggestSurprise,
        'The most important thing I did for others...': formData.pastYear.importantForOthers,
        'The biggest thing I completed...': formData.pastYear.biggestCompletion,
      },
      'The Best Moments': formData.pastYear.bestMoments,
      'Three Words': formData.pastYear.threeWords,
      'Six Questions About My Past Year': {
        'What are you most proud of?': formData.pastYear.mostProudOf,
        'Who are the three people who influenced you the most?': formData.pastYear.peopleWhoInfluenced,
        'Who are the three people you influenced the most?': formData.pastYear.peopleYouInfluenced,
        'What were you not able to accomplish?': formData.pastYear.notAccomplished,
        'What is the best thing you have discovered about yourself?': formData.pastYear.bestDiscovery,
        'What are you most grateful for?': formData.pastYear.mostGratefulFor,
      },
      'Three Biggest Accomplishments': {
        'List your three greatest accomplishments': formData.pastYear.biggestAccomplishments,
        'What did you do to achieve these?': formData.pastYear.howAchieved,
        'Who helped you achieve these successes?': formData.pastYear.whoHelped,
      },
      'Three Biggest Challenges': {
        'List your three biggest challenges': formData.pastYear.biggestChallenges,
        'Who or what helped you overcome these challenges?': formData.pastYear.whoHelpedChallenges,
        'What have you learned about yourself?': formData.pastYear.challengeLearnings,
      },
      'Forgiveness': formData.pastYear.forgiveness,
      'Letting Go': formData.pastYear.lettingGo,
      'Book Title': formData.pastYear.bookTitle,
    });

    // Year Ahead Section
    await addSection('The Year Ahead', {
      'Dare to Dream Big': formData.yearAhead.dreamBig,
      'Year Overview': {
        'Personal Life, Family': formData.yearAhead.yearOverview.personalFamily,
        'Career, Studies': formData.yearAhead.yearOverview.careerStudies,
        'Friends, Community': formData.yearAhead.yearOverview.friendsCommunity,
        'Relaxation, Hobbies, Creativity': formData.yearAhead.yearOverview.relaxationHobbiesCreativity,
        'Physical Health, Fitness': formData.yearAhead.yearOverview.physicalHealthFitness,
        'Mental Health, Self-Knowledge': formData.yearAhead.yearOverview.mentalHealthSelfKnowledge,
        'Habits That Define You': formData.yearAhead.yearOverview.habitsThatDefineYou,
        'A Better Tomorrow': formData.yearAhead.yearOverview.betterTomorrow,
      },
      'Magical Triplets': {
        'I will love these three things about myself': formData.yearAhead.magicalTriplets.loveAboutSelf,
        'I am ready to let go of these three things': formData.yearAhead.magicalTriplets.letGoOf,
        'I want to achieve these three things the most': formData.yearAhead.magicalTriplets.achieveMost,
        'These three people will be my pillars during rough times': formData.yearAhead.magicalTriplets.pillarsInRoughTimes,
        'I will dare to discover these three things': formData.yearAhead.magicalTriplets.dareToDiscover,
        'I will have the power to say no to these three things': formData.yearAhead.magicalTriplets.sayNoTo,
        'I will make my surroundings cozy with these three things': formData.yearAhead.magicalTriplets.surroundingsCozy,
        'I will do these three things every morning': formData.yearAhead.magicalTriplets.morningRoutine,
        'I will pamper myself with these three things regularly': formData.yearAhead.magicalTriplets.pamperSelf,
        'I will visit these three places': formData.yearAhead.magicalTriplets.placesToVisit,
        'I will connect with my loved ones in these three ways': formData.yearAhead.magicalTriplets.connectWithLovedOnes,
        'I will reward my successes with these three presents': formData.yearAhead.magicalTriplets.rewardSuccesses,
      },
      'Six Sentences About My Next Year': {
        'This year I will not procrastinate any more over...': formData.yearAhead.sixSentences.notProcrastinate,
        'This year I will draw the most energy from...': formData.yearAhead.sixSentences.drawEnergyFrom,
        'This year, I will be bravest when...': formData.yearAhead.sixSentences.beBravest,
        'This year I will say yes when...': formData.yearAhead.sixSentences.sayYesTo,
        'This year I advise myself to...': formData.yearAhead.sixSentences.adviseSelf,
        'This year will be special for me because...': formData.yearAhead.sixSentences.specialBecause,
      },
      'Word of the Year': formData.yearAhead.wordOfYear,
      'Secret Wish': formData.yearAhead.secretWish,
    });

    // Closing Section
    await addSection('Closing', {
      'Date': formData.closing.date || '',
      'Signature': formData.closing.signature ? 'Signed' : 'Not signed',
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

yearCompassAnalyzer.ts - Implementation Guide

CONTEXT:
This is an enhancement to an existing YearCompass web application that currently captures user reflections 
through formData with pastYear, yearAhead, and closing sections. The goal is to add AI-powered analysis capabilities 
that provide users with meaningful insights from their responses.

DATA STRUCTURE:
Currently working with:
- formData.pastYear (reflections, accomplishments, challenges)
- formData.yearAhead (goals, plans, intentions)
- formData.closing (signature, date)

ANALYZER FRAMEWORKS & PROMPTS:

1. PATTERN RECOGNITION RADAR 🎯
Input Mapping:
{
  past: {
    keyEvents: formData.pastYear.calendarReview,
    lifeSections: formData.pastYear.yearOverview,
    achievements: formData.pastYear.biggestAccomplishments,
    challenges: formData.pastYear.biggestChallenges,
    learnings: formData.pastYear.challengeLearnings
  },
  future: {
    intentions: formData.yearAhead.dreamBig,
    lifeSections: formData.yearAhead.yearOverview,
    goals: formData.yearAhead.magicalTriplets.achieveMost
  }
}

Analysis Prompt:
"As an AI analyst reviewing YearCompass responses, analyze the following data for patterns and insights:

Context: These responses reflect a full year's review and future planning across multiple life areas.

Please analyze for:
1. Recurring Themes: Identify 2-3 key themes that appear across different life areas
2. Success Patterns: Highlight behaviors or conditions that led to positive outcomes
3. Challenge Response Patterns: Note patterns in how challenges were approached
4. Hidden Connections: Point out non-obvious links between experiences
5. Growth Indicators: Identify areas showing clear progression

Format your response with clear headings and actionable insights."

2. GROWTH ARCHITECTURE 🌟
Input Mapping:
{
  foundations: {
    pastAccomplishments: formData.pastYear.biggestAccomplishments,
    pastLessons: formData.pastYear.biggestLesson,
    supportSystems: formData.pastYear.whoHelped
  },
  aspirations: {
    futureGoals: formData.yearAhead.magicalTriplets.achieveMost,
    personalGrowth: formData.yearAhead.yearOverview.mentalHealthSelfKnowledge,
    plannedSupport: formData.yearAhead.magicalTriplets.pillarsInRoughTimes
  }
}

Analysis Prompt:
"As an AI growth analyst, examine these YearCompass responses to map the user's development:

Please analyze and provide:
1. Growth Foundation: Key strengths and support systems demonstrated
2. Building Blocks: How different accomplishments built upon each other
3. Support Structures: Most effective people, habits, or systems
4. Growth Catalysts: Key moments or decisions that accelerated development
5. Future Framework: How to build upon this foundation

Present findings in a clear, actionable format."

3. ENERGY FLOW MAP ⚡
Input Mapping:
{
  pastPatterns: {
    bestMoments: formData.pastYear.bestMoments,
    challenges: formData.pastYear.biggestChallenges,
    proudMoments: formData.pastYear.mostProudOf
  },
  futureOptimization: {
    energySources: formData.yearAhead.sixSentences.drawEnergyFrom,
    selfCare: formData.yearAhead.magicalTriplets.pamperSelf,
    morningRoutine: formData.yearAhead.magicalTriplets.morningRoutine
  }
}

Analysis Prompt:
"As an AI energy pattern analyst, create an energy flow assessment:

Please analyze and map:
1. Energy Sources: Activities, people, and situations that energized
2. Energy Drains: Patterns in what depleted energy
3. Peak Performance: Circumstances for best performance
4. Recovery Patterns: Effective methods for energy replenishment
5. Energy Management: Practical ways to optimize energy use

Structure response with clear insights and actionable recommendations."

IMPLEMENTATION REQUIREMENTS:

1. User Interface
- Add analyzer selection panel to existing layout
- Display available analyzers with descriptions
- Show loading states during analysis
- Present results in collapsible sections
- Include options to save/export analysis

2. Functionality
- Process responses through selected framework
- Generate insights based on framework prompts
- Allow users to save/share analysis results
- Handle incomplete responses gracefully
- Provide feedback on analysis quality

3. Error Handling
- Check for minimum required responses
- Handle missing or incomplete data
- Provide meaningful error messages
- Include fallback analysis options

4. Integration Points
- Connect to existing formData state
- Add analyzer component to main layout
- Extend current export functionality
- Maintain consistent styling

NOTES:
- Keep analysis focused on personal growth and actionable insights
- Maintain privacy and data security
- Ensure results enhance rather than replace personal reflection
- Keep UI/UX consistent with existing design

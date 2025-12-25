// API endpoint for child options (dropdown values)
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return predefined options
  const options = {
    hobbies: [
      'Reading', 'Drawing', 'Sports', 'Music', 'Dancing', 'Gaming', 'Cooking', 
      'Gardening', 'Building/Lego', 'Outdoor Activities', 'Swimming', 'Cycling'
    ],
    interests: [
      'Science', 'Technology', 'Animals', 'Nature', 'Art', 'History', 'Math', 
      'Languages', 'Travel', 'Movies', 'Books', 'Space', 'Cars', 'Fashion'
    ],
    personality_traits: [
      'Outgoing', 'Shy', 'Creative', 'Analytical', 'Empathetic', 'Independent', 
      'Collaborative', 'Curious', 'Energetic', 'Calm', 'Funny', 'Serious'
    ],
    genders: ['Male', 'Female', 'Other'],
    school_grades: [
      'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', 
      '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', 
      '11th Grade', '12th Grade', 'College Freshman', 'College Sophomore', 
      'College Junior', 'College Senior', 'Graduate'
    ]
  };

  return res.status(200).json(options);
};


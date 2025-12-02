const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success:false, error:'Method not allowed' });
  try {
    const { roll, name, course, issue_date, image_name, image_base64, admin_user, admin_pass } = req.body;
    // check admin credentials from env
    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;
    if (!ADMIN_USER || !ADMIN_PASS) {
      return res.status(500).json({ success:false, error:'Admin credentials not configured on server' });
    }
    if (admin_user !== ADMIN_USER || admin_pass !== ADMIN_PASS) {
      return res.status(403).json({ success:false, error:'Invalid admin credentials' });
    }
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
      return res.status(500).json({ success:false, error:'GitHub env variables missing' });
    }

    // 1) Upload image to repo at images/<image_name>
    const imagePath = `images/${image_name}`;
    const imgApi = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${imagePath}`;
    const imgContentBase64 = image_base64; // already base64 without prefix

    // check if exists to get sha (for update)
    let shaImg = null;
    try {
      const existing = await axios.get(imgApi, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }});
      shaImg = existing.data.sha;
    } catch(e) {
      shaImg = null;
    }

    // upload image
    await axios.put(imgApi, {
      message: `Add image ${image_name} via admin panel`,
      content: imgContentBase64,
      sha: shaImg || undefined
    }, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }});

    // 2) Fetch data.json
    const dataApi = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/data.json`;
    let dataSha = null;
    let dataObj = {};
    try {
      const r = await axios.get(dataApi, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }});
      dataSha = r.data.sha;
      const content = Buffer.from(r.data.content, 'base64').toString('utf8');
      dataObj = JSON.parse(content || '{}');
    } catch(e) {
      // if not found, start new
      dataSha = null;
      dataObj = {};
    }

    // add/replace student
    dataObj[roll] = {
      name, course, issue_date, image: imagePath
    };

    const newContent = Buffer.from(JSON.stringify(dataObj, null, 2)).toString('base64');

    // upload new data.json
    await axios.put(dataApi, {
      message: `Update data.json - add ${roll}`,
      content: newContent,
      sha: dataSha || undefined
    }, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }});

    return res.json({ success:true, message:'Uploaded image and updated data.json' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, error: err.message || err.toString() });
  }
};

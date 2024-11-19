module.exports = async (req, res) => {
  if (req.method === "POST") {
    res.status(200).json({
      message: "API endpoint works!",
    });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

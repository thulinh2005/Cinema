fetch('http://localhost:5000/api/thong-ke/doanh-thu-thoi-gian?startDate=2026-03-25&endDate=2026-04-05')
  .then(res => res.json())
  .then(data => console.log("DATA:", data))
  .catch(err => console.error(err));

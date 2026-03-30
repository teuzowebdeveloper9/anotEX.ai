{
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "bill_grPs24Jtntq21pTsssLBArcD",
      "amount": 3990,
      "customer": {
        "id": "cust_USQsAb2QP1FghuuZ3TSW0etT",
        "metadata": {
          "name": "Mateus da Silva Oliveira",
          "cellphone": "88988773236",
          "taxId": "11017339341",
          "email": "mateussoftwaredeveloper@gmail.com",
          "country": "",
          "zipCode": ""
        }
      },
      "frequency": "ONE_TIME",
      "kind": [
        "PIX",
        "CARD"
      ],
      "status": "PAID",
      "products": [
        {
          "publicId": "prod_EBJQDFuU2pfcfRYbgmmuP2AE",
          "externalId": "prod_uFHtgP3NQARHx35LtuFqRTT5",
          "quantity": 1
        }
      ],
      "paidAmount": 0,
      "couponsUsed": []
    },
    "payment": {
      "amount": 3990,
      "fee": 80,
      "method": "PIX"
    }
  },
  "devMode": true
}

atus HTTP: 200
Tempo: 772 ms
{
  "received": true,
  "event": "billing.paid",
  "logId": "log_s1Wz5qHDzMkFtaqTsbuhyR0L"
}
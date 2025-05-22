const banks = [
  {
    name: 'ABSA BANK',
    code: '632005',
    logo: '/images/absa.png',
    accountRegex: /^\d{9}$/,
    accountMessage: 'ABSA account numbers must be 9 digits'
  },
  {
    name: 'CAPITEC BANK', 
    code: '470010',
    logo: '/images/capitec.jpg',
    accountRegex: /^\d{10}$/,
    accountMessage: 'Capitec account numbers must be 10 digits'
  },
  {
    name: 'FIRST NATIONAL BANK',
    code: '250655', 
    logo: '/images/fnb.jpg',
    accountRegex: /^\d{11}$/,
    accountMessage: 'FNB account numbers must be 11 digits'
  },
  {
    name: 'NEDBANK',
    code: '198765',
    logo: '/images/nedbank.jpg', 
    accountRegex: /^\d{9}$/,
    accountMessage: 'Nedbank account numbers must be 9 digits'
  },
  {
    name: 'STANDARD BANK',
    code: '051001',
    logo: '/images/standard.jpg',
    accountRegex: /^\d{10}$/,
    accountMessage: 'STANDARD BANK account numbers must be 10 digits'
  }
 ];

 export default banks

import Problem from 'api-problem';

function TestProblem() {
  // $ExpectError
  new Problem();

  // $ExpectError
  new Problem('404');

  // $ExpectType Problem
  new Problem(404);

  // $ExpectType Problem
  new Problem(404, 'Not found!');

  // $ExpectType Problem
  new Problem(
    403,
    'You do not have enough credit',
    'https://example.com/probs/out-of-credit'
  );

  // $ExpectType Problem
  new Problem(
    403,
    'You do not have enough credit',
    'https://example.com/probs/out-of-credit',
    {
      detail: 'Your current balance is 30, but that costs 50.',
      instance: '/account/12345/msgs/abc',
      balance: 30,
      accounts: ['/account/12345', '/account/67890']
    }
  );

  // $ExpectType Problem
  new Problem(403, {
    detail: 'Account suspended',
    instance: '/account/12345',
    date: '2016-01-15T06:47:01.175Z',
    account_id: '12345'
  });
}

function TestInheritance() {
  // $ExpectType string
  new Problem(404).message;

  // $ExpectType string
  new Problem(404).name;

  // $ExpectType string | undefined
  new Problem(404).stack;
}

function TestToString() {
  // $ExpectType string
  new Problem(404).toString();
}

function TestSend() {
  // $ExpectError
  new Problem(404).send();

  const stub = {
    writeHead: (status: number) => void 0,
    end: (chunk: any) => void 0
  };

  // $ExpectType void
  new Problem(404).send(stub);

  // $ExpectType void
  new Problem(404).send(stub, 4);
}

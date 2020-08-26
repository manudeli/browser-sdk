import { TossPaymentsInstance } from '@tosspayments/sdk-types';

const SCRIPT_URL = '//js.tosspayments.com/v1';

let cachedPromise: Promise<any> | undefined;

export async function loadTossPayments(clientKey: string): Promise<TossPaymentsInstance> {
  // SSR 지원
  if (typeof window === 'undefined') {
    return {
      requestPayment() {
        throw new Error('[TossPayments.js] 서버사이드에서는 실행할 수 없습니다.');
      },
      requestBillingAuth() {
        throw new Error('[TossPayments.js] 서버사이드에서는 실행할 수 없습니다.');
      },
    };
  }

  const selectedScript = document.querySelector(`script[src="${SCRIPT_URL}"]`);

  if (selectedScript != null && cachedPromise !== undefined) {
    return cachedPromise;
  }

  if (selectedScript != null && window.TossPayments !== undefined) {
    return window.TossPayments(clientKey);
  }

  const script = document.createElement('script');
  script.src = SCRIPT_URL;

  cachedPromise = new Promise((resolve, reject) => {
    document.head.appendChild(script);

    window.addEventListener('tossPaymentsInitialize', () => {
      if (window.TossPayments !== undefined) {
        resolve(window.TossPayments(clientKey));
      } else {
        reject(new Error('[TossPayments] Instance 초기화에 실패했습니다.'));
      }
    });
  });

  return cachedPromise;
}

export { TossPaymentsInstance };

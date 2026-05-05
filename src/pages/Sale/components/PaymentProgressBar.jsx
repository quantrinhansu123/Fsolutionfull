export const PaymentProgressBar = ({ contractAmount, paidAmount }) => {
  const signedAmount = Math.round(contractAmount * 0.5);
  const paidPortion = Math.round(contractAmount * 0.5);

  const isSignedPaid = paidAmount >= signedAmount;
  const isFullyPaid = paidAmount >= contractAmount;

  const signedPercent = isSignedPaid ? 50 : Math.round((paidAmount / contractAmount) * 100);
  const paidPercent = isFullyPaid ? 50 : isSignedPaid ? Math.round(((paidAmount - signedAmount) / paidPortion) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex h-6 rounded-full overflow-hidden bg-gray-200 text-xs">
        {/* Phase 1: Contract Signed 50% */}
        <div
          className={`flex items-center justify-center transition-all duration-500 ${
            isSignedPaid ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}
          style={{ width: '50%' }}
        >
          {isSignedPaid && (
            <span className="font-medium truncate px-1">
              {signedAmount.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        {/* Phase 2: Paid 50% */}
        <div
          className={`flex items-center justify-center transition-all duration-500 ${
            isFullyPaid ? 'bg-blue-500 text-white' : isSignedPaid ? 'bg-blue-300 text-blue-900' : 'bg-gray-300 text-gray-600'
          }`}
          style={{ width: '50%' }}
        >
          {(isSignedPaid || isFullyPaid) && (
            <span className="font-medium truncate px-1">
              {paidPortion.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="flex mt-1 text-[10px] font-medium">
        <div className={`w-1/2 text-center ${isSignedPaid ? 'text-emerald-600' : 'text-gray-400'}`}>
          Contract Signed 50%
        </div>
        <div className={`w-1/2 text-center ${isFullyPaid ? 'text-blue-600' : isSignedPaid ? 'text-blue-500' : 'text-gray-400'}`}>
          Paid 50%
        </div>
      </div>
    </div>
  );
};

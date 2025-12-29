import React from 'react';
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react';

/**
 * Status badge component
 */
const StatusBadge = ({ status }) => {
  const statusStyles = {
    completed: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    pending: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    failed: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  };

  const statusLabels = {
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    failed: 'Fehlgeschlagen',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
      ${statusStyles[status] || statusStyles.pending}
    `}>
      {statusLabels[status] || status}
    </span>
  );
};

/**
 * Payment method badge
 */
const PaymentMethodBadge = ({ method }) => (
  <span className="
    inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
    bg-gray-100 text-gray-600
    dark:bg-gray-700 dark:text-gray-300
  ">
    {method}
  </span>
);

/**
 * TransactionTable - Display list of transactions
 */
const TransactionTable = ({ transactions, title = 'Letzte Transaktionen' }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    const formatted = Math.abs(amount).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount >= 0 ? `+${formatted} €` : `-${formatted} €`;
  };

  return (
    <div className="
      rounded-card
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      overflow-hidden
    ">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button className="
          px-4 py-2 rounded-xl text-sm font-medium
          text-gray-600 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-200
        ">
          Alle anzeigen
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-6 py-4 text-caption font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaktion
              </th>
              <th className="text-left px-6 py-4 text-caption font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Datum
              </th>
              <th className="text-left px-6 py-4 text-caption font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Zahlungsart
              </th>
              <th className="text-left px-6 py-4 text-caption font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
              <th className="text-right px-6 py-4 text-caption font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Betrag
              </th>
              <th className="px-6 py-4 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                {/* Transaction Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="
                      w-10 h-10 rounded-full
                      bg-gray-100 dark:bg-gray-700
                      flex items-center justify-center text-lg
                      flex-shrink-0
                    ">
                      {transaction.avatar}
                    </div>
                    {/* Details */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {transaction.name}
                      </p>
                      <p className="text-caption text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {transaction.amount >= 0 ? (
                          <ArrowDownLeft className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-red-500" />
                        )}
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </span>
                </td>

                {/* Payment Method */}
                <td className="px-6 py-4 hidden md:table-cell">
                  <PaymentMethodBadge method={transaction.paymentMethod} />
                </td>

                {/* Status */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <StatusBadge status={transaction.status} />
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-right">
                  <span className={`
                    text-sm font-semibold
                    ${transaction.amount >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }
                  `}>
                    {formatAmount(transaction.amount)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <button className="
                    p-2 rounded-lg
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors duration-200
                  ">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Keine Transaktionen vorhanden
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;

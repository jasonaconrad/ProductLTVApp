export default function AlignmentTab({ draft, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Corporate Blue Chip</span>
        <input
          type="text"
          value={draft.corporate_blue_chip || ''}
          onChange={(e) => onChange({ corporate_blue_chip: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Product Initiative</span>
        <input
          type="text"
          value={draft.product_initiative || ''}
          onChange={(e) => onChange({ product_initiative: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Commercialization Owner</span>
        <input
          type="text"
          value={draft.commercialization_owner || ''}
          onChange={(e) => onChange({ commercialization_owner: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Product Operations Owner</span>
        <input
          type="text"
          value={draft.product_ops_owner || ''}
          onChange={(e) => onChange({ product_ops_owner: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <p className="col-span-2 rounded-md bg-blue-50 px-3 py-2 text-label12 text-blue-700">
        Maps this initiative to how it's tracked in corporate and product-level roadmaps, and who owns it on each side.
      </p>
    </div>
  );
}

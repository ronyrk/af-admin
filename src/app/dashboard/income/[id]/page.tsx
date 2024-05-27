import IncomeUpdated from "@/components/IncomeUpdated";
import { IncomeIProps } from "@/types";
import { unstable_noStore } from "next/cache";



async function Income({ params }: {
	params: {
		id: string
	}
}) {
	unstable_noStore();
	const res = await fetch(`https://af-admin.vercel.app/api/income/${params.id}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const data: IncomeIProps = await res.json();

	return (
		<div>
			<IncomeUpdated data={data} />
		</div>
	)
}

export default Income;
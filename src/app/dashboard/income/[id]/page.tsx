import IncomeUpdated from "@/components/IncomeUpdated";
import { IncomeIProps } from "@/types";
import { unstable_noStore } from "next/cache";
import prisma from "@/lib/prisma";


async function Income({ params }: {
	params: {
		id: string
	}
}) {
	const id = params.id;
	unstable_noStore();
	const data = await prisma.income.findUnique({
		where: {
			id,
		}
	});

	return (
		<div>
			<IncomeUpdated data={data as IncomeIProps} />
		</div>
	)
}

export default Income;
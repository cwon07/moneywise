import { z } from "zod";
import { Loader2 } from "lucide-react";

import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { useGetTransaction } from "@/features/transactions/api/use-get-transaction";
import { insertTransactionSchema } from "@/db/schema";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle}  from "@/components/ui/sheet";
import { useEditTransaction } from "@/features/transactions/api/use-edit-transaction";
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useConfirm } from "@/hooks/use-confirm";



const formSchema = insertTransactionSchema.pick({
    name: true,
});

type FormValues = z.input<typeof formSchema>

export const EditTransactionSheet = () => {
    const { isOpen, onClose, id } = useOpenTransaction();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this transaction"
        // TODO: the second line does not show up in the pop-up notification, check package version
    )

    const transactionQuery = useGetTransaction(id)
    const editMutation = useEditTransaction(id);
    const deleteMutation = useDeleteTransaction(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;

    const isLoading = transactionQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            },
        });
    }

    const onDelete = async () => {
        const ok = await confirm();

        if(ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose()
                }
            })
        }
    }

    const defaultValues = transactionQuery.data ? {
        name: transactionQuery.data.name
    } : {
        name: "",
    };
    
    return (
        <>
       <ConfirmDialog />
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        Edit Transaction
                    </SheetTitle>
                    <SheetDescription>
                        Edit an existing transaction
                    </SheetDescription>
                </SheetHeader>
                {isLoading
                    ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (                
                        <TransactionForm 
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )
                }
            </SheetContent>
        </Sheet>
        </>
    )
}
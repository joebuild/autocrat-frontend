import { ProposalWrapper } from '@themetadao/autocrat-sdk'
import { Button } from 'components/ui/button'
import Link from 'next/link'
import React, { FunctionComponent } from 'react'

interface IProps {
    proposal: ProposalWrapper
}

export const ProposalSummaryCard: FunctionComponent<IProps> = ({
    proposal,
    ...props
}) => {
    const proposalState = Object.keys(proposal.account.state)[0]

    return (
        <div className="w-full rounded-lg card bg-secondary">
            <div className="card-body">
                <div className="flex flex-row justify-between mb-4">
                    <div className="text-2xl font-bold card-title">Proposal # {proposal.account.number.toNumber()}</div>
                    <div className="text-2xl font-bold capitalize card-title">{proposalState}</div>
                </div>

                {/* <p></p> */}

                <div className="flex flex-row justify-between mt-4">
                    <Button
                        variant="default"
                        size="sm"
                        className=""
                    >
                        <a
                            target="_blank"
                            href={proposal.account.descriptionUrl}
                        >
                            Proposal URL
                        </a>
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className=""
                    >
                        <Link
                            className=""
                            href={"proposals/" + proposal.account.number.toNumber().toString()}
                        >
                            See Details and Trade Conditional Markets {"->"}
                        </Link>
                    </Button>
                </div>

            </div>
        </div>
    )
}

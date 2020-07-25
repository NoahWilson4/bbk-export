import React from "react";
import classnames from "classnames";

export function Section({className,header,children}: {className?: string;header?: React.ReactNode;children?: React.ReactNode}) {
	return <section className={className}>
		{header?<h1 className="no-print">{header}</h1>:null}
		{children}
	</section>
}

export function SubSection({className,header,children}: {className?: string;header?: React.ReactNode;children?: React.ReactNode}) {
	return <div className={classnames("sub-section",className)}>
		{header? <h2>{header}</h2> : null}
		{children}
	</div>
}
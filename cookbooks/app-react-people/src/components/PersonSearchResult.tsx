import { PersonResult } from '../api-models';

export const PersonSearchResult: React.FC<{ item: PersonResult }> = ({ item }) => {
    const activePositions = item.document.positions.filter((p) => p.isActive);

    const projects = [...new Set(activePositions.map((p) => p.project.name))];
    const basePositions = [...new Set(activePositions.map((p) => p.name))];
    const externalIds = [...new Set(activePositions.map((p) => p.positionExternalId))];

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div>
                        <img
                            src={`https://pro-s-portal-ci.azurewebsites.net/images/profiles/${item.document.azureUniqueId}`}
                        />
                        <div
                            style={{
                                marginTop: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                fontSize: '80%',
                            }}
                        >
                            <div>Score</div>
                            <div style={{ fontSize: '110%' }}>{item['@search.score']}</div>
                        </div>
                    </div>
                    <div style={{ marginLeft: 50, minWidth: 230 }}>
                        <div style={{ fontWeight: 'bold', paddingBottom: 4 }}>
                            {item.document.name}
                        </div>
                        <div style={{ paddingBottom: 8 }}>{item.document.jobTitle}</div>
                        <div>{item.document.department}</div>
                        <div>{item.document.mobilePhone}</div>
                        <div>{item.document.mail}</div>

                        <div style={{ marginTop: 8 }}>
                            <a href={`msteams:/l/chat/0/0?users=${item.document.mail}`}>Chat</a> |
                            <a href={`callto:${item.document.mail}`}>Call</a> |
                            <a
                                href={`https://eur.delve.office.com/?u=${item.document.azureUniqueId}&v=work`}
                                target="_new"
                            >
                                {' '}
                                Delve{' '}
                            </a>
                        </div>
                    </div>
                    <div style={{ marginLeft: 50, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {projects.map((p) => (
                                <div
                                    style={{
                                        backgroundColor: '#c0efe4',
                                        padding: '5px 15px',
                                        borderRadius: 15,
                                        marginRight: 8,
                                    }}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
                            {basePositions.map((p) => (
                                <div
                                    style={{
                                        backgroundColor: 'rgb(239, 192, 207)',
                                        padding: '5px 15px',
                                        borderRadius: 15,
                                        marginRight: 8,
                                    }}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
                            {externalIds.map((p) => (
                                <div
                                    style={{
                                        backgroundColor: 'rgb(237, 143, 243)',
                                        padding: '5px 15px',
                                        borderRadius: 15,
                                        marginRight: 8,
                                    }}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <hr
                style={{
                    marginBottom: 20,
                    marginTop: 20,
                    opacity: 0.3,
                    maxWidth: 350,
                    marginLeft: 0,
                }}
            />
        </>
    );
};

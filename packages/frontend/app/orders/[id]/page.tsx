export default function orderPage({ params }: { params: { id: string } }) {
    return <div>My Post: {params.id}</div>
  }